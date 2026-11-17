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
    private let floatingGlass = UIVisualEffectView()
    private var webAppReady = false
    private var launchArtworkOverlay: UIView?
    private var launchPresentedAt: TimeInterval = 0
    private var launchDismissPending = false

    private let gold = UIColor(red: 184.0 / 255.0, green: 151.0 / 255.0, blue: 62.0 / 255.0, alpha: 1)

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.configuration.userContentController.add(
            WeakTabMessageHandler(owner: self), name: "gnzNativeTabs"
        )
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        configureTabBar()
        presentLaunchArtwork()
    }

    // Native, full-bleed continuation of LaunchScreen.storyboard.
    // The source visual is a phone mockup: the oversized image view clips
    // precisely into its interior, without retaining the phone frame.
    private func presentLaunchArtwork() {
        guard let image = UIImage(named: "GaspardLaunchPortrait") else { return }
        let overlay = UIView()
        overlay.translatesAutoresizingMaskIntoConstraints = false
        overlay.backgroundColor = UIColor(red: 28.0 / 255.0, green: 18.0 / 255.0, blue: 8.0 / 255.0, alpha: 1)
        overlay.clipsToBounds = true
        overlay.isUserInteractionEnabled = true
        overlay.accessibilityElementsHidden = true

        let artwork = UIImageView(image: image)
        artwork.translatesAutoresizingMaskIntoConstraints = false
        artwork.contentMode = .scaleAspectFill
        artwork.isAccessibilityElement = false
        overlay.addSubview(artwork)
        view.addSubview(overlay)

        NSLayoutConstraint.activate([
            overlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            overlay.topAnchor.constraint(equalTo: view.topAnchor),
            overlay.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            artwork.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
            artwork.centerYAnchor.constraint(equalTo: overlay.centerYAnchor),
            artwork.widthAnchor.constraint(equalTo: overlay.widthAnchor, multiplier: 1.57),
            artwork.heightAnchor.constraint(equalTo: overlay.heightAnchor, multiplier: 1.09)
        ])
        launchArtworkOverlay = overlay
        launchPresentedAt = Date().timeIntervalSinceReferenceDate

        // Always release the overlay, including if the web bridge never responds.
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5) { [weak self] in
            self?.dismissLaunchArtworkWhenReady()
        }
    }

    private func dismissLaunchArtworkWhenReady() {
        guard launchArtworkOverlay != nil, !launchDismissPending else { return }
        launchDismissPending = true
        let minimumDuration: TimeInterval = 1.15
        let remaining = max(0, minimumDuration - (Date().timeIntervalSinceReferenceDate - launchPresentedAt))
        DispatchQueue.main.asyncAfter(deadline: .now() + remaining) { [weak self] in
            guard let self = self, let overlay = self.launchArtworkOverlay else { return }
            let duration: TimeInterval = UIAccessibility.isReduceMotionEnabled ? 0 : 0.42
            UIView.animate(withDuration: duration, delay: 0, options: .curveEaseInOut, animations: {
                overlay.alpha = 0
            }, completion: { _ in
                overlay.removeFromSuperview()
                self.launchArtworkOverlay = nil
            })
        }
    }

    private func configureTabBar() {
        let appearance = UITabBarAppearance()
        // A single floating Apple material replaces the full-width gray panel.
        // Leave the tab bar itself transparent to prevent a double backdrop.
        appearance.configureWithTransparentBackground()
        appearance.shadowColor = .clear
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor.label.withAlphaComponent(0.82)
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor.label.withAlphaComponent(0.84)
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
        tabBar.isTranslucent = true
        tabBar.backgroundColor = .clear
        tabBar.tintColor = gold
        tabBar.unselectedItemTintColor = UIColor.label.withAlphaComponent(0.82)
        tabBar.delegate = self
        tabBar.items = GaspardTab.allCases.enumerated().map { index, tab in
            let item = UITabBarItem(title: tab.title, image: UIImage(systemName: tab.symbol), tag: index)
            item.accessibilityLabel = tab.title
            return item
        }
        tabBar.selectedItem = tabBar.items?.first
        tabBar.isHidden = true

        // Use actual UIKit Liquid Glass on iOS 26+, with a system blur on 15-25.
        if #available(iOS 26.0, *) {
            floatingGlass.effect = UIGlassEffect()
        } else {
            floatingGlass.effect = UIBlurEffect(style: .systemThinMaterial)
        }
        floatingGlass.isUserInteractionEnabled = false
        floatingGlass.isHidden = true
        floatingGlass.layer.cornerRadius = 34
        floatingGlass.clipsToBounds = true
        floatingGlass.translatesAutoresizingMaskIntoConstraints = false
        tabBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(floatingGlass)
        view.addSubview(tabBar)

        NSLayoutConstraint.activate([
            floatingGlass.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 12),
            floatingGlass.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            floatingGlass.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -8),
            floatingGlass.heightAnchor.constraint(equalToConstant: 68),
            tabBar.leadingAnchor.constraint(equalTo: floatingGlass.leadingAnchor),
            tabBar.trailingAnchor.constraint(equalTo: floatingGlass.trailingAnchor),
            tabBar.topAnchor.constraint(equalTo: floatingGlass.topAnchor),
            tabBar.bottomAnchor.constraint(equalTo: floatingGlass.bottomAnchor)
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
        floatingGlass.isHidden = !visible
        if visible { dismissLaunchArtworkWhenReady() }

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
