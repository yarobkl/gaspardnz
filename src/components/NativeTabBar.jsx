import { useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { nativeFeedback } from "../utils/nativeHaptics.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Barre iOS : la capsule occupe la hauteur entière de l'onglet.
 * Toucher = comportement de bouton classique ; glisser horizontalement =
 * déplacement direct sous le doigt puis verrouillage sur l'onglet le plus proche.
 */
export default function NativeTabBar({ tabs, labels, activeTab, onSelect, Icon }) {
  const navRef = useRef(null);
  const boxesRef = useRef([]);
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);
  const initializedRef = useRef(false);
  const animationRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const [pill, setPill] = useState({ width: 0, height: 0, top: 0 });
  const activeIndex = Math.max(0, tabs.findIndex(([key]) => key === activeTab));

  const settle = (targetX) => {
    animationRef.current?.stop?.();
    if (reduceMotion) {
      x.set(targetX);
      return;
    }
    animationRef.current = animate(x, targetX, {
      type: "spring", stiffness: 520, damping: 42, mass: 0.78,
    });
  };

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const measure = () => {
      const rect = nav.getBoundingClientRect();
      const buttons = [...nav.querySelectorAll("button[data-native-tab]")];
      const boxes = buttons.map((button) => {
        const r = button.getBoundingClientRect();
        return {
          x: r.left - rect.left + 3,
          center: r.left + r.width / 2,
          top: r.top - rect.top,
          width: Math.max(0, r.width - 6),
          height: r.height,
        };
      });
      boxesRef.current = boxes;
      const current = boxes[activeIndex];
      if (!current) return;
      setPill((previous) => (
        previous.width === current.width &&
        previous.height === current.height &&
        previous.top === current.top
          ? previous
          : { width: current.width, height: current.height, top: current.top }
      ));
      if (!gestureRef.current?.dragging) {
        if (!initializedRef.current || reduceMotion) x.set(current.x);
        else settle(current.x);
      }
      initializedRef.current = true;
    };

    measure();
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(nav);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeIndex, labels, reduceMotion, x]);

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!boxesRef.current.length) return;
    suppressClickRef.current = false;
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    };
  };

  const onPointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;

    if (!gesture.dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        gestureRef.current = null;
        return;
      }
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      gesture.dragging = true;
      animationRef.current?.stop?.();
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    const boxes = boxesRef.current;
    if (!boxes.length) return;
    const first = boxes[0];
    const last = boxes[boxes.length - 1];
    const nav = navRef.current.getBoundingClientRect();
    const desired = event.clientX - nav.left - first.width / 2;
    x.set(clamp(desired, first.x, last.x));
    if (event.cancelable) event.preventDefault();
  };

  const onPointerUp = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    if (!gesture.dragging) return;

    suppressClickRef.current = true;
    const boxes = boxesRef.current;
    const closest = boxes.reduce((best, box, index) => (
      Math.abs(box.center - event.clientX) < Math.abs(boxes[best].center - event.clientX)
        ? index : best
    ), 0);
    settle(boxes[closest].x);
    const selected = tabs[closest]?.[0];
    if (selected) {
      if (selected !== activeTab) nativeFeedback("selection");
      onSelect(selected);
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onPointerCancel = (event) => {
    if (gestureRef.current?.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    const current = boxesRef.current[activeIndex];
    if (current) settle(current.x);
  };

  return (
    <nav
      ref={navRef}
      className="gnz-native-tabs gnz-native-tabs-draggable"
      aria-label={labels.navigation}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <motion.span
        className="gnz-native-tab-pill"
        aria-hidden="true"
        style={{
          x, left: 0, top: pill.top,
          width: pill.width, height: pill.height,
          opacity: pill.width > 0 ? 1 : 0,
        }}
      />
      {tabs.map(([key], index) => (
        <button
          key={key}
          data-native-tab={key}
          type="button"
          onClick={() => onSelect(key)}
          aria-current={activeTab === key ? "page" : undefined}
          className={activeTab === key ? "active" : ""}
        >
          <span aria-hidden="true"><Icon name={key} /></span>
          <small>{labels.tabs[index]}</small>
        </button>
      ))}
    </nav>
  );
}
