import ActivityKit
import Foundation
import UserNotifications

/// Private, on-device reminders. Only an accepted Cal.com embed event from the
/// booking flow can schedule these; the data is never sent to our CRM as proof
/// of a booking. Server-verified events remain the source of truth for staff.
@MainActor
final class GNZAppointmentReminders {
    static let shared = GNZAppointmentReminders()

    private struct Appointment: Codable {
        let reference: String
        let startsAt: Date
    }

    private let storageKey = "gnz.accepted.appointments.v1"
    private let notifications = UNUserNotificationCenter.current()

    private init() {}

    private var appointments: [Appointment] {
        get {
            guard let data = UserDefaults.standard.data(forKey: storageKey),
                  let entries = try? JSONDecoder().decode([Appointment].self, from: data) else {
                return []
            }
            return entries
        }
        set {
            let relevant = newValue.filter { $0.startsAt > Date().addingTimeInterval(-86_400) }
            if let data = try? JSONEncoder().encode(relevant) {
                UserDefaults.standard.set(data, forKey: storageKey)
            }
        }
    }

    /// Result values are deliberately fixed strings so they can safely be
    /// reported to the booking page without exposing event or attendee data.
    func receiveCalBooking(_ message: [String: Any]) async -> String {
        guard message["type"] as? String == "cal-booking-success",
              let reference = message["uid"] as? String,
              (8...128).contains(reference.count),
              reference.unicodeScalars.allSatisfy({
                  CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_").contains($0)
              }),
              let rawStart = message["startTime"] as? String,
              let date = parseDate(rawStart),
              date > Date().addingTimeInterval(60),
              date < Date().addingTimeInterval(366 * 86_400) else {
            return "invalid"
        }

        let status = (message["status"] as? String ?? "").uppercased()
        // Cal.com's successful embed event may be unconfirmed. No reminders
        // are scheduled for pending, cancelled, unknown or payment states.
        guard status == "ACCEPTED" || status == "CONFIRMED" else {
            return "pending"
        }

        let appointment = Appointment(reference: reference, startsAt: date)
        var entries = appointments
        entries.removeAll { $0.reference == reference }
        entries.append(appointment)
        appointments = entries

        // Schedule the booking that was just accepted, even if other dates
        // are already stored on this iPhone.
        let activityScheduled = await ensureLiveActivity(for: appointment)
        let identifiers = reminderIDs(for: reference)
        notifications.removePendingNotificationRequests(withIdentifiers: identifiers)

        do {
            let permitted = try await notifications.requestAuthorization(options: [.alert, .sound])
            guard permitted else { return activityScheduled ? "live-scheduled" : "permission-denied" }
            try await scheduleLocalReminders(for: appointment, includeTwoHour: !activityScheduled)
            return activityScheduled ? "live-scheduled" : "scheduled"
        } catch {
            return activityScheduled ? "live-scheduled" : "unavailable"
        }
    }

    func applicationBecameActive() {
        // iOS 26 schedules in advance, even while the app is later closed.
        // Earlier iOS versions retain the foreground-only ActivityKit path.
        Task {
            let upcoming = appointments.filter { $0.startsAt > Date() }
                .sorted(by: { $0.startsAt < $1.startsAt })
            var scheduledReferences = Set<String>()
            // ActivityKit counts pre-scheduled items towards the system limit.
            // Keep the on-device queue deliberately small.
            for entry in upcoming.prefix(3) {
                if await ensureLiveActivity(for: entry) {
                    scheduledReferences.insert(entry.reference)
                }
            }

            let settings = await notifications.notificationSettings()
            guard settings.authorizationStatus == .authorized ||
                  settings.authorizationStatus == .provisional else { return }
            // Allows a client who enabled notifications in Settings after
            // booking to receive remaining reminders without rebooking.
            for entry in upcoming.prefix(8) {
                let liveForThisAppointment = scheduledReferences.contains(entry.reference) ||
                    isActivityKnown(for: entry.reference, startsAt: entry.startsAt)
                if liveForThisAppointment {
                    notifications.removePendingNotificationRequests(withIdentifiers: [reminderIDs(for: entry.reference)[1]])
                }
                try? await scheduleLocalReminders(for: entry, includeTwoHour: !liveForThisAppointment)
            }
        }
    }

    private func parseDate(_ value: String) -> Date? {
        let parser = ISO8601DateFormatter()
        parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = parser.date(from: value) { return date }
        parser.formatOptions = [.withInternetDateTime]
        return parser.date(from: value)
    }

    private func reminderIDs(for reference: String) -> [String] {
        ["gnz.appointment.\(reference).day", "gnz.appointment.\(reference).two-hours"]
    }

    private func scheduleLocalReminders(for entry: Appointment, includeTwoHour: Bool) async throws {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale.current
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .short
        let leadTimes: [(label: String, seconds: TimeInterval, wording: String)] = [
            ("day", 86_400, "Votre rendez-vous est demain"),
            ("two-hours", 7_200, "Votre rendez-vous approche")
        ]

        for lead in leadTimes {
            if lead.label == "two-hours" && !includeTwoHour { continue }
            let timeUntilReminder = entry.startsAt.addingTimeInterval(-lead.seconds).timeIntervalSinceNow
            guard timeUntilReminder > 1 else { continue }
            let content = UNMutableNotificationContent()
            content.title = "GNZ PARIS · \(lead.wording)"
            content.body = "Rendez-vous showroom · \(dateFormatter.string(from: entry.startsAt))."
            content.sound = .default
            let request = UNNotificationRequest(
                identifier: "gnz.appointment.\(entry.reference).\(lead.label)",
                content: content,
                trigger: UNTimeIntervalNotificationTrigger(timeInterval: timeUntilReminder, repeats: false)
            )
            try await notifications.add(request)
        }
    }

    private func isActivityKnown(for reference: String, startsAt: Date) -> Bool {
        guard #available(iOS 16.2, *) else { return false }
        return Activity<GNZAppointmentAttributes>.activities.contains(where: {
            $0.attributes.bookingReference == reference &&
            $0.activityState != .ended && $0.activityState != .dismissed &&
            abs($0.content.state.startsAt.timeIntervalSince(startsAt)) < 1
        })
    }

    @discardableResult
    private func ensureLiveActivity(for appointment: Appointment) async -> Bool {
        guard #available(iOS 16.2, *), ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
        let now = Date()
        guard appointment.startsAt > now else { return false }

        if isActivityKnown(for: appointment.reference, startsAt: appointment.startsAt) { return true }

        // If Cal.com reuses the booking UID when a client changes the date
        // inside the app, never leave an outdated scheduled activity behind.
        for activity in Activity<GNZAppointmentAttributes>.activities
            where activity.attributes.bookingReference == appointment.reference &&
                activity.activityState != .ended && activity.activityState != .dismissed {
            await activity.end(nil, dismissalPolicy: .immediate)
        }

        let attributes = GNZAppointmentAttributes(bookingReference: appointment.reference)
        let state = GNZAppointmentAttributes.ContentState(
            serviceTitle: "Rendez-vous showroom",
            startsAt: appointment.startsAt,
            status: .confirmed
        )
        do {
            let content = ActivityContent(state: state, staleDate: appointment.startsAt.addingTimeInterval(7_200))
            let twoHoursBefore = appointment.startsAt.addingTimeInterval(-7_200)
            if #available(iOS 26.0, *), twoHoursBefore > now.addingTimeInterval(5) {
                // Apple starts this pre-scheduled Live Activity at the chosen
                // date even if GNZ PARIS is closed or in the background.
                // An alert is mandatory for this iOS 26 API.
                _ = try Activity<GNZAppointmentAttributes>.request(
                    attributes: attributes,
                    content: content,
                    pushType: nil,
                    style: .standard,
                    alertConfiguration: AlertConfiguration(
                        title: "GNZ PARIS",
                        body: "Votre rendez-vous showroom approche.",
                        sound: .default
                    ),
                    start: twoHoursBefore
                )
            } else if appointment.startsAt.timeIntervalSince(now) <= 7_205 {
                // Fallback on iOS 16.2-25: a foreground launch is required.
                _ = try Activity<GNZAppointmentAttributes>.request(
                    attributes: attributes,
                    content: content,
                    pushType: nil
                )
            } else {
                return false
            }
            return true
        } catch {
            // Local reminders remain available when ActivityKit declines the request.
            return false
        }
    }
}
