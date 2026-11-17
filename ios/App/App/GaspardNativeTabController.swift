import UIKit
import WebKit
import Capacitor

// Keep the dedicated NativeExperience navigation and its existing five routes.
// Only the navigation chrome is supplied by UIKit.
private enum GaspardTab: String, CaseIterable {
    case home
    case services
    case gallery
    case news
    case more

    var title: String {
        switch self {
        case .home: return "Accueil"
        case .services: return "Services"
        case .gallery: return "Galerie"
        case .news: return "Actualités"
        case .more: return "Plus"
        }
    }

    var symbol: String {
        switch self {
        case .home: return "house"
        case .services: return "square.grid.2x2"
        case .gallery: return "photo.on.rectangle"
        case .news: return "newspaper"
        case .more: return "ellipsis.circle"
        }
    }
}

// WKUserContentController retains handlers strongly; the owner must be weak to
// avoid keeping the entire Capacitor controller (and WebView) alive forever.
private final class WeakTabMessageHandler: NSObject, WKScriptMessageHandler {
    weak var owner: GaspardNativeTabController?

    init(owner: GaspardNativeTabController) {
        self.owner = owner
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        owner?.handleTabMessage(message)
    }
}

final class GaspardNativeTabController: CAPBridgeViewController, UITabBarDelegate {
    private let tabBar = UITabBar()
    private let bottomBackground = UIView()
    private var webAppReady = false

    private let cream = UIColor(red: 245.0 / 255.0, green: 240.0 / 255.0, blue: 232.0 / 255.0, alpha: 1)
    private let gold = UIColor(red: 184.0 / 255.0, green: 151.0 / 255.0, blue: 62.0 / 255.0, alpha: 1)
    private let ink = UIColor(red: 28.0 / 255.0, green: 18.0 / 255.0, blue: 8.0 / 255.0, alpha: 1)

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.configuration.userContentController.add(
            WeakTabMessageHandler(owner: self), name: "gnzNativeTabs"
        )
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        configureTabBar()
    }

    private func configureTabBar() {
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        // iOS 26 uses the system glass appearance. Older iOS versions get
        // the discreet cream background from the GaspardNZ identity.
        if #unavailable(iOS 26.0) {
            appearance.backgroundColor = cream.withAlphaComponent(0.96)
        }
        appearance.stackedLayoutAppearance.normal.iconColor = ink.withAlphaComponent(0.55)
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: ink.withAlphaComponent(0.62)
        ]
        appearance.stackedLayoutAppearance.selected.iconColor = gold
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: gold,
            .font: UIFont.systemFont(ofSize: 10, weight: .semibold)
        ]

        tabBar.standardAppearance = appearance
        if #available(iOS 15.0, *) {
            tabBar.scrollEdgeAppearance = appearance
        }
        tabBar.tintColor = gold
        tabBar.unselectedItemTintColor = ink.withAlphaComponent(0.55)
        tabBar.delegate = self
        tabBar.items = GaspardTab.allCases.enumerated().map { index, tab in
            let item = UITabBarItem(title: tab.title, image: UIImage(systemName: tab.symbol), tag: index)
            item.accessibilityLabel = tab.title
            return item
        }
        tabBar.selectedItem = tabBar.items?.first
        tabBar.isHidden = true

        bottomBackground.backgroundColor = cream
        bottomBackground.isUserInteractionEnabled = false
        bottomBackground.isHidden = true
        bottomBackground.translatesAutoresizingMaskIntoConstraints = false
        tabBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bottomBackground)
        view.addSubview(tabBar)

        NSLayoutConstraint.activate([
            bottomBackground.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            bottomBackground.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            bottomBackground.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -56),
            bottomBackground.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            tabBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tabBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tabBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -56),
            tabBar.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        guard webAppReady, GaspardTab.allCases.indices.contains(item.tag) else { return }
        let selected = GaspardTab.allCases[item.tag]
        UISelectionFeedbackGenerator().selectionChanged()
        // The route is an enum value, never arbitrary content from a webpage.
        let js = "window.dispatchEvent(new CustomEvent('gnz:native-tab', { detail: { tab: '\(selected.rawValue)' } }))"
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    fileprivate func handleTabMessage(_ message: WKScriptMessage) {
        guard message.name == "gnzNativeTabs",
              let body = message.body as? [String: Any],
              body["type"] as? String == "state" else { return }

        webAppReady = true
        let visible = body["visible"] as? Bool ?? false
        tabBar.isHidden = !visible
        bottomBackground.isHidden = !visible

        if let key = body["selected"] as? String,
           let index = GaspardTab.allCases.firstIndex(where: { $0.rawValue == key }) {
            tabBar.selectedItem = tabBar.items?[index]
        }
        if let labels = body["labels"] as? [String], labels.count == GaspardTab.allCases.count {
            for (index, item) in (tabBar.items ?? []).enumerated() {
                item.title = labels[index]
                item.accessibilityLabel = labels[index]
            }
        }
    }
}
