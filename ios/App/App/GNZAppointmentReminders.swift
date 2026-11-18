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

        let identifiers = reminderIDs(for: reference)
        notifications.removePendingNotificationRequests(withIdentifiers: identifiers)

        do {
            let permitted = try await notifications.requestAuthorization(options: [.alert, .sound])
            guard permitted else { return "permission-denied" }
            try await scheduleLocalReminders(for: appointment)
            startLiveActivityIfAppropriate()
            return "scheduled"
        } catch {
            return "unavailable"
        }
    }

    func applicationBecameActive() {
        // ActivityKit cannot be scheduled months ahead. Re-entering the app
        // during the final two hours creates the genuine short-lived activity.
        startLiveActivityIfAppropriate()
        Task {
            let settings = await notifications.notificationSettings()
            guard settings.authorizationStatus == .authorized ||
                  settings.authorizationStatus == .provisional else { return }
            // Allows a client who enabled notifications in Settings after
            // booking to receive remaining reminders without rebooking.
            for entry in appointments.filter({ $0.startsAt > Date() })
                .sorted(by: { $0.startsAt < $1.startsAt }).prefix(8) {
                try? await scheduleLocalReminders(for: entry)
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

    private func scheduleLocalReminders(for entry: Appointment) async throws {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale.current
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .short
        let leadTimes: [(label: String, seconds: TimeInterval, wording: String)] = [
            ("day", 86_400, "Votre rendez-vous est demain"),
            ("two-hours", 7_200, "Votre rendez-vous approche")
        ]

        for lead in leadTimes {
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

    private func startLiveActivityIfAppropriate() {
        guard #available(iOS 16.2, *), ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        let now = Date()
        guard let upcoming = appointments
            .filter({ $0.startsAt > now && $0.startsAt.timeIntervalSince(now) <= 7_200 })
            .sorted(by: { $0.startsAt < $1.startsAt }).first else { return }

        guard !Activity<GNZAppointmentAttributes>.activities.contains(where: {
            $0.attributes.bookingReference == upcoming.reference
        }) else { return }

        let attributes = GNZAppointmentAttributes(bookingReference: upcoming.reference)
        let state = GNZAppointmentAttributes.ContentState(
            serviceTitle: "Rendez-vous showroom",
            startsAt: upcoming.startsAt,
            status: .confirmed
        )
        do {
            _ = try Activity<GNZAppointmentAttributes>.request(
                attributes: attributes,
                content: ActivityContent(state: state, staleDate: upcoming.startsAt.addingTimeInterval(7_200)),
                pushType: nil
            )
        } catch {
            // Local reminders remain available even when Live Activities are disabled.
        }
    }
}
