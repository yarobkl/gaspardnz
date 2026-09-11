import { describe, expect, it } from "vitest";
import { layoutHotspots } from "../../src/components/ui/PhotoHotspots.jsx";

describe("layoutHotspots", () => {
  it("keeps rendered points inside a safe photo margin", () => {
    const laidOut = layoutHotspots([
      { x: -20, y: 150, label: "outside" },
      { left: "99%", top: "2%", label: "css coordinates" },
    ]);

    for (const spot of laidOut) {
      expect(spot.__renderX).toBeGreaterThanOrEqual(8);
      expect(spot.__renderX).toBeLessThanOrEqual(92);
      expect(spot.__renderY).toBeGreaterThanOrEqual(8);
      expect(spot.__renderY).toBeLessThanOrEqual(92);
    }
  });

  it("separates points that would visually overlap", () => {
    const laidOut = layoutHotspots([
      { x: 50, y: 50, label: "one" },
      { x: 50, y: 50, label: "two" },
      { x: 50, y: 56, label: "three" },
    ]);

    for (let i = 0; i < laidOut.length; i += 1) {
      for (let j = i + 1; j < laidOut.length; j += 1) {
        const distance = Math.hypot(
          laidOut[i].__renderX - laidOut[j].__renderX,
          laidOut[i].__renderY - laidOut[j].__renderY,
        );
        expect(distance).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it("does not mutate the source hotspot coordinates", () => {
    const source = [{ x: 50, y: 50, label: "original" }];
    layoutHotspots(source);
    expect(source).toEqual([{ x: 50, y: 50, label: "original" }]);
  });
});
