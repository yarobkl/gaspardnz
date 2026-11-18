import SwiftUI
import WidgetKit

private struct GNZQuickAccessEntry: TimelineEntry {
    let date: Date
}

private struct GNZQuickAccessProvider: TimelineProvider {
    func placeholder(in context: Context) -> GNZQuickAccessEntry {
        GNZQuickAccessEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (GNZQuickAccessEntry) -> Void) {
        completion(GNZQuickAccessEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GNZQuickAccessEntry>) -> Void) {
        completion(Timeline(entries: [GNZQuickAccessEntry(date: Date())], policy: .never))
    }
}

private enum GNZQuickLinks {
    static let services = URL(string: "gnzparis://open/services")!
    static let booking = URL(string: "gnzparis://open/booking")!
}

private struct GNZQuickAccessView: View {
    @Environment(\.widgetFamily) private var family

    private var content: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("GNZ PARIS")
                .font(.system(size: 24, weight: .regular, design: .serif))
                .tracking(1.3)
                .foregroundStyle(GNZActivityPalette.navy)

            Rectangle()
                .fill(GNZActivityPalette.gold)
                .frame(width: 38, height: 2)
                .accessibilityHidden(true)

            Text("S’habiller autrement")
                .font(.footnote)
                .foregroundStyle(GNZActivityPalette.navy.opacity(0.78))

            Spacer(minLength: 0)

            if family == .systemSmall {
                Label("Prestations", systemImage: "arrow.up.right")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(GNZActivityPalette.navy)
            } else {
                HStack(spacing: 16) {
                    Link(destination: GNZQuickLinks.services) {
                        Label("Prestations", systemImage: "square.grid.2x2")
                    }
                    Link(destination: GNZQuickLinks.booking) {
                        Label("Réserver", systemImage: "calendar")
                    }
                }
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(GNZActivityPalette.navy)
                .accessibilityElement(children: .contain)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .widgetURL(family == .systemSmall ? GNZQuickLinks.services : nil)
    }

    @ViewBuilder
    var body: some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(GNZActivityPalette.cream, for: .widget)
        } else {
            content.background(GNZActivityPalette.cream)
        }
    }
}

struct GNZQuickAccessWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "com.gaspardnz.quick-access", provider: GNZQuickAccessProvider()) { _ in
            GNZQuickAccessView()
        }
        .configurationDisplayName("GNZ PARIS")
        .description("Accédez à nos prestations et au calendrier de rendez-vous.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
