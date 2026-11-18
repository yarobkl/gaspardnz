import ActivityKit
import SwiftUI
import WidgetKit

private enum GNZActivityPalette {
    static let navy = Color(red: 0.01, green: 0.055, blue: 0.115)
    static let gold = Color(red: 0.76, green: 0.61, blue: 0.36)
    static let cream = Color(red: 0.99, green: 0.97, blue: 0.94)
}

@available(iOS 16.2, *)
private struct GNZAppointmentSummary: View {
    let state: GNZAppointmentAttributes.ContentState

    private var title: String {
        switch state.status {
        case .confirmed: return "Votre rendez-vous"
        case .rescheduled: return "Rendez-vous déplacé"
        case .cancelled: return "Rendez-vous annulé"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: "tie")
                    .foregroundStyle(GNZActivityPalette.gold)
                    .accessibilityHidden(true)
                Text("GNZ PARIS")
                    .font(.caption.weight(.semibold))
                    .tracking(2)
                    .foregroundStyle(GNZActivityPalette.gold)
            }

            Text(title)
                .font(.headline)
                .foregroundStyle(GNZActivityPalette.cream)

            Text(state.serviceTitle)
                .font(.subheadline)
                .lineLimit(2)
                .foregroundStyle(GNZActivityPalette.cream)

            HStack(spacing: 5) {
                Image(systemName: "calendar")
                    .accessibilityHidden(true)
                Text(state.startsAt, style: .date)
                Text("·")
                Text(state.startsAt, style: .time)
            }
            .font(.footnote.monospacedDigit())
            .foregroundStyle(GNZActivityPalette.cream.opacity(0.9))
        }
        .accessibilityElement(children: .combine)
    }
}

@available(iOS 16.2, *)
struct GNZAppointmentLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GNZAppointmentAttributes.self) { context in
            HStack(alignment: .center) {
                GNZAppointmentSummary(state: context.state)
                Spacer(minLength: 8)
                Image(systemName: "calendar.badge.clock")
                    .font(.title2)
                    .foregroundStyle(GNZActivityPalette.gold)
                    .accessibilityHidden(true)
            }
            .padding(18)
            .activityBackgroundTint(GNZActivityPalette.navy)
            .activitySystemActionForegroundColor(GNZActivityPalette.cream)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("GNZ PARIS")
                        .font(.caption.weight(.bold))
                        .tracking(1.3)
                        .foregroundStyle(GNZActivityPalette.gold)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.startsAt, style: .time)
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.white)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(context.state.status == .cancelled ? "Rendez-vous annulé" : "Votre rendez-vous")
                            .font(.caption.weight(.semibold))
                        Text(context.state.serviceTitle)
                            .font(.subheadline)
                            .lineLimit(1)
                        Text(context.state.startsAt, style: .date)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .accessibilityElement(children: .combine)
                }
            } compactLeading: {
                Text("GNZ")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(GNZActivityPalette.gold)
                    .accessibilityLabel("GNZ PARIS")
            } compactTrailing: {
                Text(context.state.startsAt, style: .time)
                    .font(.caption2.monospacedDigit())
            } minimal: {
                Image(systemName: "calendar")
                    .foregroundStyle(GNZActivityPalette.gold)
                    .accessibilityLabel("Rendez-vous GNZ PARIS")
            }
        }
    }
}

@main
struct GNZWidgetBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 16.2, *) {
            GNZAppointmentLiveActivity()
        }
    }
}
