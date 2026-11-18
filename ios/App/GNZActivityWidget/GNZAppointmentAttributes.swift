import ActivityKit
import Foundation

// Shared by the iOS app and the WidgetKit extension.
// The booking identifier is opaque: attendee names, email addresses and phone
// numbers must never be persisted in Live Activity attributes.
@available(iOS 16.2, *)
struct GNZAppointmentAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        enum BookingStatus: String, Codable, Hashable {
            case confirmed
            case rescheduled
            case cancelled
        }

        let serviceTitle: String
        let startsAt: Date
        let status: BookingStatus
    }

    let bookingReference: String
}
