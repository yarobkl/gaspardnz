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

private final class WeakBookingMessageHandler: NSObject, WKScriptMessageHandler {
    weak var owner: GaspardNativeTabController?

    init(owner: GaspardNativeTabController) { self.owner = owner }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        owner?.handleBookingMessage(message)
    }
}

final class GaspardNativeTabController: CAPBridgeViewController, UIGestureRecognizerDelegate {
    // Keep the iOS glass materials without UITabBar's oversized tab gesture.
    // Five fixed hit targets sit above a real, sliding glass selection lens.
    private let tabBar = UIStackView()
    private var tabButtons: [UIButton] = []
    private var tabIcons: [UIImageView] = []
    private var tabLabels: [UILabel] = []
    private let floatingGlass = UIVisualEffectView()
    private let selectionGlass = UIVisualEffectView()
    private let newsBadge = UIView()
    private var selectionCenterXConstraint: NSLayoutConstraint?
    private let selectionFeedback = UISelectionFeedbackGenerator()
    private var lastSelectionTick: CFTimeInterval = 0
    private var isTrackingSelection = false
    private var previewTab: GaspardTab?
    private var selectionAnimationGeneration = 0
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

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        guard !isTrackingSelection, let tab = currentBackdropTab,
              let index = GaspardTab.allCases.firstIndex(of: tab),
              tabButtons.indices.contains(index) else { return }
        let center = tabButtons[index].center.x
        if abs((selectionCenterXConstraint?.constant ?? 0) - center) > 0.5 {
            selectionCenterXConstraint?.constant = center
        }
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
        tabBar.axis = .horizontal
        tabBar.alignment = .fill
        tabBar.distribution = .fillEqually
        tabBar.spacing = 0
        tabBar.isLayoutMarginsRelativeArrangement = true
        tabBar.directionalLayoutMargins = NSDirectionalEdgeInsets(top: 6, leading: 6, bottom: 6, trailing: 6)
        tabBar.isHidden = true

        for (index, tab) in GaspardTab.allCases.enumerated() {
            let button = UIButton(type: .custom)
            button.tag = index
            button.accessibilityLabel = tab.title
            button.accessibilityTraits = [.button]
            button.layer.cornerRadius = 35
            button.addTarget(self, action: #selector(selectTab(_:)), for: .touchUpInside)

            let symbol = UIImageView(image: UIImage(systemName: tab.symbol))
            symbol.preferredSymbolConfiguration = UIImage.SymbolConfiguration(pointSize: 25, weight: .medium)
            symbol.contentMode = .scaleAspectFit
            symbol.isAccessibilityElement = false
            symbol.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                symbol.widthAnchor.constraint(equalToConstant: 28),
                symbol.heightAnchor.constraint(equalToConstant: 28)
            ])

            let label = UILabel()
            label.text = tab.title
            label.textAlignment = .center
            label.font = UIFont.systemFont(ofSize: 11, weight: .medium)
            label.adjustsFontSizeToFitWidth = true
            label.minimumScaleFactor = 0.8
            label.numberOfLines = 1
            label.isAccessibilityElement = false

            let contents = UIStackView(arrangedSubviews: [symbol, label])
            contents.axis = .vertical
            contents.alignment = .center
            contents.spacing = 3
            contents.isUserInteractionEnabled = false
            contents.translatesAutoresizingMaskIntoConstraints = false
            button.addSubview(contents)
            NSLayoutConstraint.activate([
                contents.centerXAnchor.constraint(equalTo: button.centerXAnchor),
                contents.centerYAnchor.constraint(equalTo: button.centerYAnchor),
                contents.leadingAnchor.constraint(greaterThanOrEqualTo: button.leadingAnchor, constant: 2),
                contents.trailingAnchor.constraint(lessThanOrEqualTo: button.trailingAnchor, constant: -2),
                label.widthAnchor.constraint(lessThanOrEqualTo: button.widthAnchor, constant: -4)
            ])

            tabButtons.append(button)
            tabIcons.append(symbol)
            tabLabels.append(label)
            tabBar.addArrangedSubview(button)
            if tab == .news {
                newsBadge.backgroundColor = gold
                newsBadge.layer.cornerRadius = 5
                newsBadge.layer.borderWidth = 1
                newsBadge.layer.borderColor = UIColor.white.withAlphaComponent(0.9).cgColor
                newsBadge.isAccessibilityElement = false
                newsBadge.isHidden = true
                newsBadge.translatesAutoresizingMaskIntoConstraints = false
                button.addSubview(newsBadge)
                NSLayoutConstraint.activate([
                    newsBadge.widthAnchor.constraint(equalToConstant: 10),
                    newsBadge.heightAnchor.constraint(equalToConstant: 10),
                    newsBadge.centerXAnchor.constraint(equalTo: symbol.trailingAnchor, constant: 2),
                    newsBadge.centerYAnchor.constraint(equalTo: symbol.topAnchor, constant: 2)
                ])
            }
        }

        floatingGlass.isUserInteractionEnabled = true
        floatingGlass.isHidden = true
        floatingGlass.layer.cornerRadius = 41
        floatingGlass.clipsToBounds = true
        floatingGlass.translatesAutoresizingMaskIntoConstraints = false
        selectionGlass.isUserInteractionEnabled = false
        selectionGlass.layer.cornerRadius = 34
        selectionGlass.clipsToBounds = true
        selectionGlass.translatesAutoresizingMaskIntoConstraints = false
        tabBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(floatingGlass)
        floatingGlass.contentView.addSubview(selectionGlass)
        floatingGlass.contentView.addSubview(tabBar)

        let drag = UIPanGestureRecognizer(target: self, action: #selector(dragSelection(_:)))
        drag.maximumNumberOfTouches = 1
        drag.delegate = self
        tabBar.addGestureRecognizer(drag)

        let initialSelection = selectionGlass.centerXAnchor.constraint(equalTo: tabBar.leadingAnchor)
        selectionCenterXConstraint = initialSelection
        NSLayoutConstraint.activate([
            floatingGlass.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 12),
            floatingGlass.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -12),
            floatingGlass.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -8),
            floatingGlass.heightAnchor.constraint(equalToConstant: 82),
            tabBar.leadingAnchor.constraint(equalTo: floatingGlass.contentView.leadingAnchor),
            tabBar.trailingAnchor.constraint(equalTo: floatingGlass.contentView.trailingAnchor),
            tabBar.topAnchor.constraint(equalTo: floatingGlass.contentView.topAnchor),
            tabBar.bottomAnchor.constraint(equalTo: floatingGlass.contentView.bottomAnchor),
            selectionGlass.widthAnchor.constraint(equalTo: tabButtons[0].widthAnchor),
            selectionGlass.heightAnchor.constraint(equalTo: tabButtons[0].heightAnchor),
            selectionGlass.centerYAnchor.constraint(equalTo: tabButtons[0].centerYAnchor),
            initialSelection
        ])
        updateBackdrop(for: .home)
    }

    private func updateBackdrop(for tab: GaspardTab, animated: Bool = false) {
        guard currentBackdropTab != tab else { return }
        currentBackdropTab = tab
        let overPortrait = tab == .home

        // Clear Liquid Glass keeps photography and editorial pages visible
        // through the capsule, as on the QR Permanent floating navigation.
        if #available(iOS 26.0, *) {
            let backdrop = UIGlassEffect(style: .clear)
            backdrop.isInteractive = false
            floatingGlass.effect = backdrop

            let highlight = UIGlassEffect(style: .clear)
            highlight.isInteractive = true
            highlight.tintColor = overPortrait
                ? UIColor.white.withAlphaComponent(0.10)
                : gold.withAlphaComponent(0.12)
            selectionGlass.effect = highlight
        } else {
            floatingGlass.effect = UIBlurEffect(style: overPortrait ? .systemUltraThinMaterialDark : .systemUltraThinMaterialLight)
            selectionGlass.effect = UIBlurEffect(style: .systemThinMaterialLight)
        }

        updateTabAppearance(for: tab)
        moveSelection(to: tab, animated: animated)
    }

    private func updateTabAppearance(for tab: GaspardTab) {
        let foreground = currentBackdropTab == .home
            ? UIColor.white.withAlphaComponent(0.95)
            : UIColor.label.withAlphaComponent(0.82)
        for (index, button) in tabButtons.enumerated() {
            let selected = GaspardTab.allCases[index] == tab
            let color = selected ? gold : foreground
            button.isSelected = selected
            button.accessibilityTraits = selected ? [.button, .selected] : [.button]
            tabIcons[index].tintColor = color
            tabLabels[index].textColor = color
            tabLabels[index].font = UIFont.systemFont(ofSize: 11, weight: selected ? .semibold : .medium)
        }
    }

    private func moveSelection(to tab: GaspardTab, animated: Bool) {
        guard let index = GaspardTab.allCases.firstIndex(of: tab), tabButtons.indices.contains(index) else { return }
        floatingGlass.contentView.layoutIfNeeded()
        let target = tabButtons[index].center.x
        guard abs((selectionCenterXConstraint?.constant ?? 0) - target) > 0.5 else { return }
        selectionAnimationGeneration += 1
        let generation = selectionAnimationGeneration
        if animated && !UIAccessibility.isReduceMotionEnabled {
            isTrackingSelection = true
            selectionCenterXConstraint?.constant = target
            // QR Permanent uses native TabView responsiveness: settle promptly
            // while preserving the GNZ glass lens that follows a finger.
            UIView.animate(withDuration: 0.34, delay: 0, usingSpringWithDamping: 0.88, initialSpringVelocity: 0.34, options: [.beginFromCurrentState, .allowUserInteraction]) {
                self.floatingGlass.contentView.layoutIfNeeded()
            } completion: { _ in
                if self.selectionAnimationGeneration == generation {
                    self.isTrackingSelection = false
                }
            }
        } else {
            selectionCenterXConstraint?.constant = target
            floatingGlass.contentView.layoutIfNeeded()
        }
    }

    private func tab(at position: CGFloat) -> GaspardTab {
        let index = tabButtons.indices.min(by: {
            abs(tabButtons[$0].center.x - position) < abs(tabButtons[$1].center.x - position)
        }) ?? 0
        return GaspardTab.allCases[index]
    }

    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        guard let pan = gestureRecognizer as? UIPanGestureRecognizer else { return true }
        let velocity = pan.velocity(in: tabBar)
        return abs(velocity.x) > abs(velocity.y)
    }

    @objc private func dragSelection(_ gesture: UIPanGestureRecognizer) {
        guard webAppReady, let first = tabButtons.first, let last = tabButtons.last else { return }
        switch gesture.state {
        case .began, .changed:
            if gesture.state == .began {
                // Interrupt from the presentation position, never from the
                // previous destination (fast reversals must not jump).
                let displayedX = selectionGlass.layer.presentation()?.position.x
                selectionAnimationGeneration += 1
                selectionGlass.layer.removeAllAnimations()
                if let displayedX = displayedX, displayedX.isFinite {
                    selectionCenterXConstraint?.constant = displayedX
                    floatingGlass.contentView.layoutIfNeeded()
                }
                isTrackingSelection = true
                lastSelectionTick = 0
                selectionFeedback.prepare()
            }
            let x = max(first.center.x, min(last.center.x, gesture.location(in: tabBar).x))
            selectionCenterXConstraint?.constant = x
            floatingGlass.contentView.layoutIfNeeded()
            let hovered = tab(at: x)
            if hovered != previewTab {
                let now = CACurrentMediaTime()
                if (previewTab != nil || hovered != currentBackdropTab) && now - lastSelectionTick >= 0.055 {
                    selectionFeedback.selectionChanged()
                    lastSelectionTick = now
                }
                selectionFeedback.prepare()
                previewTab = hovered
                updateTabAppearance(for: hovered)
            }
        case .ended:
            // Project the release very slightly, so a quick swipe settles on
            // the intended tab while the lens keeps following the finger.
            let velocity = gesture.velocity(in: tabBar).x
            let projectedX = gesture.location(in: tabBar).x + max(-45, min(45, velocity * 0.07))
            let hovered = tab(at: projectedX)
            previewTab = nil
            isTrackingSelection = false
            commitSelection(hovered, haptic: false)
        case .cancelled, .failed:
            previewTab = nil
            isTrackingSelection = false
            if let selected = currentBackdropTab {
                updateTabAppearance(for: selected)
                moveSelection(to: selected, animated: true)
            }
        default: break
        }
    }

    private func commitSelection(_ selected: GaspardTab, haptic: Bool) {
        guard webAppReady else { return }
        if haptic && selected != currentBackdropTab {
            selectionFeedback.prepare()
            selectionFeedback.selectionChanged()
        }
        if currentBackdropTab == selected {
            updateTabAppearance(for: selected)
            moveSelection(to: selected, animated: true)
        } else {
            updateBackdrop(for: selected, animated: true)
        }
        // The route is an enum value, never arbitrary content from a webpage.
        let js = "window.dispatchEvent(new CustomEvent('gnz:native-tab', { detail: { tab: '\(selected.rawValue)' } }))"
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    @objc private func selectTab(_ button: UIButton) {
        guard webAppReady, GaspardTab.allCases.indices.contains(button.tag) else { return }
        commitSelection(GaspardTab.allCases[button.tag], haptic: true)
    }

    fileprivate func handleTabMessage(_ message: WKScriptMessage) {
        guard message.name == "gnzNativeTabs",
              let body = message.body as? [String: Any],
              body["type"] as? String == "state" else { return }

        let visible = body["visible"] as? Bool ?? false
        webAppReady = visible
        tabBar.isHidden = !visible
        floatingGlass.isHidden = !visible
        if visible { dismissLaunchArtworkWhenReady() }

        if let key = body["selected"] as? String,
           let index = GaspardTab.allCases.firstIndex(where: { $0.rawValue == key }) {
            updateBackdrop(for: GaspardTab.allCases[index])
        }
        if let labels = body["labels"] as? [String], labels.count == GaspardTab.allCases.count {
            for (index, button) in tabButtons.enumerated() {
                tabLabels[index].text = labels[index]
                button.accessibilityLabel = labels[index]
            }
        }
        if let unread = body["newsUnread"] as? Bool {
            newsBadge.isHidden = !unread
            if let newsIndex = GaspardTab.allCases.firstIndex(of: .news) {
                tabButtons[newsIndex].accessibilityValue = unread ? "Nouvelle actualité à découvrir" : nil
            }
        }
        deliverPendingShortcut()
    }
}
