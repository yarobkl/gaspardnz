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

// A compact native control keeps its SF Symbol and label in separate rows.
// UITabBar may switch to an inline layout on newer iOS releases, which is not
// compatible with the short floating capsule used by this application.
private final class GaspardTabButton: UIControl {
    private let icon = UIImageView()
    private let caption = UILabel()

    init(tab: GaspardTab) {
        super.init(frame: .zero)
        translatesAutoresizingMaskIntoConstraints = false
        isAccessibilityElement = true
        accessibilityTraits = .button

        icon.image = UIImage(systemName: tab.symbol)
        icon.contentMode = .scaleAspectFit
        icon.translatesAutoresizingMaskIntoConstraints = false
        icon.isAccessibilityElement = false

        caption.text = tab.title
        caption.font = .systemFont(ofSize: 10, weight: .medium)
        caption.textAlignment = .center
        caption.adjustsFontSizeToFitWidth = true
        caption.minimumScaleFactor = 0.85
        caption.numberOfLines = 1
        caption.isAccessibilityElement = false
        accessibilityLabel = tab.title

        let content = UIStackView(arrangedSubviews: [icon, caption])
        content.axis = .vertical
        content.alignment = .fill
        content.spacing = 4
        content.isUserInteractionEnabled = false
        content.translatesAutoresizingMaskIntoConstraints = false
        addSubview(content)

        NSLayoutConstraint.activate([
            icon.heightAnchor.constraint(equalToConstant: 21),
            content.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 2),
            content.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -2),
            content.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func update(title: String) {
        caption.text = title
        accessibilityLabel = title
    }

    func update(foreground: UIColor, selected: Bool) {
        isSelected = selected
        icon.tintColor = foreground
        caption.textColor = foreground
        icon.preferredSymbolConfiguration = UIImage.SymbolConfiguration(
            pointSize: 20, weight: selected ? .semibold : .regular
        )
        accessibilityTraits = selected ? [.button, .selected] : .button
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

private final class WeakBookingMessageHandler: NSObject, WKScriptMessageHandler {
    weak var owner: GaspardNativeTabController?

    init(owner: GaspardNativeTabController) { self.owner = owner }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        owner?.handleBookingMessage(message)
    }
}

final class GaspardNativeTabController: CAPBridgeViewController {
    private let floatingBar = UIView()
    private let floatingGlass = UIVisualEffectView()
    private let selectionPill = UIView()
    private var tabButtons: [GaspardTabButton] = []
    private var pillLeadingConstraint: NSLayoutConstraint?
    private var selectedTab: GaspardTab = .home
    private var currentBackdropTab: GaspardTab?
    private var webAppReady = false
    private var launchArtworkOverlay: UIView?
    private var launchPresentedAt: TimeInterval = 0
    private var launchDismissPending = false
    private var shortcutObserver: NSObjectProtocol?
    private var foregroundObserver: NSObjectProtocol?
    private var deliveringShortcut = false

    private let gold = UIColor(red: 184.0 / 255.0, green: 151.0 / 255.0, blue: 62.0 / 255.0, alpha: 1)

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.configuration.userContentController.add(
            WeakTabMessageHandler(owner: self), name: "gnzNativeTabs"
        )
        webView?.configuration.userContentController.add(
            WeakBookingMessageHandler(owner: self), name: "gnzBookingReminders"
        )
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        configureTabBar()
        presentLaunchArtwork()
        shortcutObserver = NotificationCenter.default.addObserver(
            forName: GNZShortcutRouter.didRequestRoute, object: nil, queue: .main
        ) { [weak self] _ in
            self?.deliverPendingShortcut()
        }
        foregroundObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main
        ) { _ in
            Task { @MainActor in GNZAppointmentReminders.shared.applicationBecameActive() }
        }
        GNZAppointmentReminders.shared.applicationBecameActive()
    }

    deinit {
        if let shortcutObserver = shortcutObserver {
            NotificationCenter.default.removeObserver(shortcutObserver)
        }
        if let foregroundObserver = foregroundObserver {
            NotificationCenter.default.removeObserver(foregroundObserver)
        }
    }

    fileprivate func handleBookingMessage(_ message: WKScriptMessage) {
        // Only the packaged first-party page may request on-device reminders;
        // Cal.com runs inside a cross-origin iframe and communicates via its SDK.
        guard message.name == "gnzBookingReminders", message.frameInfo.isMainFrame,
              message.frameInfo.securityOrigin.host.lowercased() == "localhost",
              let body = message.body as? [String: Any] else { return }
        Task { @MainActor [weak self] in
            let status = await GNZAppointmentReminders.shared.receiveCalBooking(body)
            let js = "window.dispatchEvent(new CustomEvent('gnz:appointment-reminder-result', {detail: {status: '\(status)'}}))"
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    private func deliverPendingShortcut() {
        guard webAppReady, !deliveringShortcut,
              let pending = GNZShortcutRouter.pending,
              let webView = webView else { return }
        deliveringShortcut = true
        // destination comes from a fixed Swift enum; it cannot inject script.
        let js = "window.dispatchEvent(new CustomEvent('gnz:shortcut-route', { detail: { route: '\(pending.destination.rawValue)' } }))"
        webView.evaluateJavaScript(js) { [weak self] _, error in
            if error == nil { GNZShortcutRouter.clearIfDelivered(pending) }
            self?.deliveringShortcut = false
            // A second Siri request may have arrived while the first was in flight.
            if error == nil { self?.deliverPendingShortcut() }
        }
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
        floatingBar.translatesAutoresizingMaskIntoConstraints = false
        floatingBar.isHidden = true
        floatingBar.layer.cornerRadius = 34
        floatingBar.clipsToBounds = true

        floatingGlass.isUserInteractionEnabled = false
        floatingGlass.translatesAutoresizingMaskIntoConstraints = false

        selectionPill.translatesAutoresizingMaskIntoConstraints = false
        selectionPill.isUserInteractionEnabled = false
        selectionPill.layer.cornerRadius = 25

        tabButtons = GaspardTab.allCases.enumerated().map { index, tab in
            let button = GaspardTabButton(tab: tab)
            button.tag = index
            button.addTarget(self, action: #selector(didTapTab(_:)), for: .touchUpInside)
            return button
        }
        let buttonRow = UIStackView(arrangedSubviews: tabButtons)
        buttonRow.axis = .horizontal
        buttonRow.alignment = .fill
        buttonRow.distribution = .fillEqually
        buttonRow.spacing = 0
        buttonRow.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(floatingBar)
        floatingBar.addSubview(floatingGlass)
        floatingBar.addSubview(selectionPill)
        floatingBar.addSubview(buttonRow)

        let initialPillLeading = selectionPill.leadingAnchor.constraint(
            equalTo: tabButtons[0].leadingAnchor, constant: 3
        )
        pillLeadingConstraint = initialPillLeading
        let pillWidth = selectionPill.widthAnchor.constraint(
            equalTo: tabButtons[0].widthAnchor, constant: -6
        )

        NSLayoutConstraint.activate([
            floatingBar.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 12),
            floatingBar.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            floatingBar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -8),
            floatingBar.heightAnchor.constraint(equalToConstant: 68),
            floatingGlass.leadingAnchor.constraint(equalTo: floatingBar.leadingAnchor),
            floatingGlass.trailingAnchor.constraint(equalTo: floatingBar.trailingAnchor),
            floatingGlass.topAnchor.constraint(equalTo: floatingBar.topAnchor),
            floatingGlass.bottomAnchor.constraint(equalTo: floatingBar.bottomAnchor),
            buttonRow.leadingAnchor.constraint(equalTo: floatingBar.leadingAnchor, constant: 7),
            buttonRow.trailingAnchor.constraint(equalTo: floatingBar.trailingAnchor, constant: -7),
            buttonRow.topAnchor.constraint(equalTo: floatingBar.topAnchor),
            buttonRow.bottomAnchor.constraint(equalTo: floatingBar.bottomAnchor),
            selectionPill.topAnchor.constraint(equalTo: floatingBar.topAnchor, constant: 9),
            selectionPill.bottomAnchor.constraint(equalTo: floatingBar.bottomAnchor, constant: -9),
            initialPillLeading,
            pillWidth
        ])

        // The photograph and the editorial pages use distinct native glass
        // treatments, but neither changes the icon/label geometry.
        updateBackdrop(for: .home)
    }

    private func updateBackdrop(for tab: GaspardTab) {
        guard currentBackdropTab != tab else { return }
        let needsNewMaterial = currentBackdropTab == nil || (currentBackdropTab == .home) != (tab == .home)
        currentBackdropTab = tab
        let overPortrait = tab == .home
        let foreground = overPortrait
            ? UIColor.white.withAlphaComponent(0.95)
            : UIColor.label.withAlphaComponent(0.82)

        // Clear Liquid Glass exposes the photograph; regular glass keeps
        // controls legible over text and light editorial content.
        if needsNewMaterial {
            if #available(iOS 26.0, *) {
                floatingGlass.effect = UIGlassEffect(style: overPortrait ? .clear : .regular)
            } else {
                floatingGlass.effect = UIBlurEffect(style: overPortrait ? .systemThinMaterialDark : .systemThinMaterialLight)
            }
        }

        selectionPill.backgroundColor = overPortrait
            ? UIColor.white.withAlphaComponent(0.18)
            : UIColor.black.withAlphaComponent(0.07)
        for (index, button) in tabButtons.enumerated() {
            let isSelected = GaspardTab.allCases[index] == tab
            button.update(foreground: isSelected ? gold : foreground, selected: isSelected)
        }
    }

    private func selectTab(_ tab: GaspardTab, animated: Bool) {
        guard let index = GaspardTab.allCases.firstIndex(of: tab) else { return }
        let hasChanged = selectedTab != tab
        if hasChanged {
            // Keep the selection track behind the buttons and move it only
            // horizontally. An Auto Layout width shared by all tabs prevents
            // jitter on compact iPhones and when long labels are translated.
            floatingBar.layoutIfNeeded()
            pillLeadingConstraint?.isActive = false
            let next = selectionPill.leadingAnchor.constraint(
                equalTo: tabButtons[index].leadingAnchor, constant: 3
            )
            next.isActive = true
            pillLeadingConstraint = next
        }
        selectedTab = tab
        updateBackdrop(for: tab)
        if hasChanged {
            if animated && !UIAccessibility.isReduceMotionEnabled {
                UIView.animate(withDuration: 0.27, delay: 0, options: [.curveEaseInOut, .beginFromCurrentState]) {
                    self.floatingBar.layoutIfNeeded()
                }
            } else {
                floatingBar.layoutIfNeeded()
            }
        }
    }

    @objc private func didTapTab(_ sender: GaspardTabButton) {
        guard webAppReady, GaspardTab.allCases.indices.contains(sender.tag) else { return }
        let selected = GaspardTab.allCases[sender.tag]
        selectTab(selected, animated: true)
        UISelectionFeedbackGenerator().selectionChanged()
        // The route is an enum value, never arbitrary content from a webpage.
        let js = "window.dispatchEvent(new CustomEvent('gnz:native-tab', { detail: { tab: '\(selected.rawValue)' } }))"
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    fileprivate func handleTabMessage(_ message: WKScriptMessage) {
        guard message.name == "gnzNativeTabs",
              let body = message.body as? [String: Any],
              body["type"] as? String == "state" else { return }

        let visible = body["visible"] as? Bool ?? false
        webAppReady = visible
        floatingBar.isHidden = !visible
        if visible { dismissLaunchArtworkWhenReady() }

        if let key = body["selected"] as? String,
           let index = GaspardTab.allCases.firstIndex(where: { $0.rawValue == key }) {
            selectTab(GaspardTab.allCases[index], animated: visible)
        }
        if let labels = body["labels"] as? [String], labels.count == GaspardTab.allCases.count {
            for (index, button) in tabButtons.enumerated() {
                button.update(title: labels[index])
            }
        }
        deliverPendingShortcut()
    }
}
