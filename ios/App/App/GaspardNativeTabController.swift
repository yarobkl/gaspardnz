import UIKit
import WebKit
import Capacitor

// Keep one Capacitor WebView (and its session) while exposing a real UIKit
// tab bar. Each tab asks the React app to open an existing destination.
private enum GaspardTab: String, CaseIterable {
    case home
    case gallery
    case news
    case showroom
    case booking

    var title: String {
        switch self {
        case .home: return "Accueil"
        case .gallery: return "Galerie"
        case .news: return "Actualités"
        case .showroom: return "Showroom"
        case .booking: return "RDV"
        }
    }

    var symbol: String {
        switch self {
        case .home: return "house"
        case .gallery: return "square.grid.2x2"
        case .news: return "newspaper"
        case .showroom: return "building.2"
        case .booking: return "calendar"
        }
    }
}

// WKUserContentController retains its message handler, so it must not retain
// the view controller (which owns the WKWebView) in return.
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
    private let safeAreaBackground = UIView()
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
        configureNativeTabs()
    }

    private func configureNativeTabs() {
        let appearance = UITabBarAppearance()
        appearance.configureWithDefaultBackground()
        // Keep Apple's system Liquid Glass material on iOS 26 and newer.
        // Earlier versions receive a subtle cream tint from our brand.
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
            let item = UITabBarItem(
                title: tab.title,
                image: UIImage(systemName: tab.symbol),
                tag: index
            )
            item.accessibilityLabel = tab.title
            return item
        }
        tabBar.selectedItem = tabBar.items?.first
        tabBar.isHidden = true
        safeAreaBackground.isHidden = true

        safeAreaBackground.backgroundColor = cream
        safeAreaBackground.isUserInteractionEnabled = false
        safeAreaBackground.translatesAutoresizingMaskIntoConstraints = false
        tabBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(safeAreaBackground)
        view.addSubview(tabBar)

        // The bar includes the iPhone home-indicator safe area. Its tappable
        // content is the standard 56pt tab row above the safe-area boundary.
        NSLayoutConstraint.activate([
            safeAreaBackground.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            safeAreaBackground.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            safeAreaBackground.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -56),
            safeAreaBackground.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            tabBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tabBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tabBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -56),
            tabBar.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        guard webAppReady, GaspardTab.allCases.indices.contains(item.tag) else { return }
        let tab = GaspardTab.allCases[item.tag]
        UISelectionFeedbackGenerator().selectionChanged()
        // A fixed enum value is interpolated; no untrusted string is ever
        // evaluated as JavaScript.
        let js = """
        if (window.__gnzNativeTabsReady) {
          window.dispatchEvent(new CustomEvent('gnz:native-tab', { detail: { tab: '\(tab.rawValue)' } }));
        } else {
          window.location.assign('/?gnzTab=\(tab.rawValue)');
        }
        """
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    fileprivate func handleTabMessage(_ message: WKScriptMessage) {
        guard message.name == "gnzNativeTabs",
              let body = message.body as? [String: Any],
              body["type"] as? String == "state" else { return }

        webAppReady = true
        let visible = body["visible"] as? Bool ?? false
        tabBar.isHidden = !visible
        safeAreaBackground.isHidden = !visible

        if let tabName = body["selected"] as? String,
           let index = GaspardTab.allCases.firstIndex(where: { $0.rawValue == tabName }) {
            tabBar.selectedItem = tabBar.items?[index]
        }
    }
}
