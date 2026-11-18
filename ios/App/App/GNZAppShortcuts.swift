import AppIntents
import Foundation

// App Intents can launch the app before the Capacitor WebView is mounted.
// Keep only an allowlisted destination until the web navigation bridge is ready.
enum GNZShortcutDestination: String {
    case services
    case gallery
    case news
    case booking
}

enum GNZShortcutRouter {
    struct PendingRoute {
        let destination: GNZShortcutDestination
        let requestedAt: TimeInterval
    }

    static let didRequestRoute = Notification.Name("gnzShortcutDidRequestRoute")
    private static let routeKey = "gnz.pendingShortcutRoute"
    private static let dateKey = "gnz.pendingShortcutDate"
    private static let expiry: TimeInterval = 300

    static func request(_ destination: GNZShortcutDestination) {
        UserDefaults.standard.set(destination.rawValue, forKey: routeKey)
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: dateKey)
        NotificationCenter.default.post(name: didRequestRoute, object: nil)
    }

    static var pending: PendingRoute? {
        let defaults = UserDefaults.standard
        let requestedAt = defaults.double(forKey: dateKey)
        let age = Date().timeIntervalSince1970 - requestedAt
        guard age >= 0, age < expiry,
              let rawValue = defaults.string(forKey: routeKey),
              let destination = GNZShortcutDestination(rawValue: rawValue) else {
            clear()
            return nil
        }
        return PendingRoute(destination: destination, requestedAt: requestedAt)
    }

    static func clearIfDelivered(_ route: PendingRoute) {
        guard let current = pending,
              current.destination == route.destination,
              current.requestedAt == route.requestedAt else { return }
        clear()
    }

    private static func clear() {
        UserDefaults.standard.removeObject(forKey: routeKey)
        UserDefaults.standard.removeObject(forKey: dateKey)
    }
}

// These routes are available as genuine Siri / Shortcuts actions on iOS 18+.
// They open public pages only; no personal appointment data is inferred.
@available(iOS 18.0, *)
struct GNZOpenServicesIntent: AppIntent {
    static let title: LocalizedStringResource = "Découvrir les prestations GNZ PARIS"
    static let description = IntentDescription("Ouvre la liste des prestations de GaspardNZ.")
    static let openAppWhenRun = true // iOS 18–25 fallback
    @available(iOS 26.0, *)
    static var supportedModes: IntentModes { .foreground(.immediate) }

    @MainActor
    func perform() async throws -> some IntentResult {
        GNZShortcutRouter.request(.services)
        return .result()
    }
}

@available(iOS 18.0, *)
struct GNZOpenGalleryIntent: AppIntent {
    static let title: LocalizedStringResource = "Voir la galerie GNZ PARIS"
    static let description = IntentDescription("Ouvre les photographies et créations GaspardNZ.")
    static let openAppWhenRun = true // iOS 18–25 fallback
    @available(iOS 26.0, *)
    static var supportedModes: IntentModes { .foreground(.immediate) }

    @MainActor
    func perform() async throws -> some IntentResult {
        GNZShortcutRouter.request(.gallery)
        return .result()
    }
}

@available(iOS 18.0, *)
struct GNZOpenNewsIntent: AppIntent {
    static let title: LocalizedStringResource = "Lire les actualités GNZ PARIS"
    static let description = IntentDescription("Ouvre le journal et les dernières actualités de GaspardNZ.")
    static let openAppWhenRun = true // iOS 18–25 fallback
    @available(iOS 26.0, *)
    static var supportedModes: IntentModes { .foreground(.immediate) }

    @MainActor
    func perform() async throws -> some IntentResult {
        GNZShortcutRouter.request(.news)
        return .result()
    }
}

@available(iOS 18.0, *)
struct GNZOpenBookingIntent: AppIntent {
    static let title: LocalizedStringResource = "Réserver avec GNZ PARIS"
    static let description = IntentDescription("Ouvre le calendrier pour choisir un rendez-vous avec GaspardNZ.")
    static let openAppWhenRun = true // iOS 18–25 fallback
    @available(iOS 26.0, *)
    static var supportedModes: IntentModes { .foreground(.immediate) }

    @MainActor
    func perform() async throws -> some IntentResult {
        GNZShortcutRouter.request(.booking)
        return .result()
    }
}

@available(iOS 18.0, *)
struct GNZAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: GNZOpenServicesIntent(),
            phrases: ["Montre les prestations de \(.applicationName)", "Ouvre les services de \(.applicationName)"],
            shortTitle: "Prestations",
            systemImageName: "square.grid.2x2"
        )
        AppShortcut(
            intent: GNZOpenGalleryIntent(),
            phrases: ["Ouvre la galerie de \(.applicationName)"],
            shortTitle: "Galerie",
            systemImageName: "photo.on.rectangle"
        )
        AppShortcut(
            intent: GNZOpenNewsIntent(),
            phrases: ["Montre les actualités de \(.applicationName)"],
            shortTitle: "Actualités",
            systemImageName: "newspaper"
        )
        AppShortcut(
            intent: GNZOpenBookingIntent(),
            phrases: ["Prendre rendez-vous avec \(.applicationName)"],
            shortTitle: "Réserver",
            systemImageName: "calendar.badge.plus"
        )
    }
}
