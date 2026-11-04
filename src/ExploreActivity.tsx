import { useEffect, useRef } from "react";
export default function ExploreActivity({
  index,
  onComplete,
  children,
}: {
  index: number;
  onComplete: () => void;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const done = useRef(false);
  const sawMutation = useRef(false);
  const sawMissingPiece = useRef(false);
  const sawDirect = useRef(false);
  const loadingBaseline = useRef<number | undefined>(undefined);
  const clickedDuringLoading = useRef(false);
  const latest = useRef(onComplete);
  latest.current = onComplete;
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    function check() {
      if (!el || !interacted.current || done.current) return;
      const pressed = (name: string) =>
        Array.from(el.querySelectorAll('button[aria-pressed="true"]')).some(
          (b) => b.textContent === name,
        );
      const switchOn = (name: string) =>
        Array.from(el.querySelectorAll('[role="switch"]')).some(
          (b) =>
            b.textContent?.trim() === name &&
            b.getAttribute("aria-checked") === "true",
        );
      const input = (label: string) =>
        el.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)
          ?.value || "";
      let success = false;
      switch (index) {
        case 0:
          success =
            pressed("Arrow") &&
            input("Greeting name").trim() !== "" &&
            input("Greeting name") !== "Designer";
          break;
        case 1:
          if (pressed("Direct access")) sawDirect.current = true;
          success =
            sawDirect.current && pressed("Object") && pressed("Destructure");
          break;
        case 2:
          success =
            !!el.querySelector(".d-memory-new .d-chips") &&
            el.textContent?.includes("distinct references") === true;
          break;
        case 3:
          success =
            input("User ID") !== "42" &&
            input("User ID") !== "" &&
            !switchOn("isActive");
          break;
        case 4:
          success =
            el.querySelectorAll(".d-map-preview li").length > 3 &&
            el.querySelector(".d-map-preview .d-selected-row > span")
              ?.textContent === "3";
          break;
        case 5:
          success =
            input("Filter search").trim() !== "" &&
            el.querySelectorAll(".d-filter-preview ul li").length === 1;
          break;
        case 6:
          success = pressed("reduce") && switchOn("Include “Ship”");
          break;
        case 7:
          success = switchOn("isLoggedIn") && switchOn("hasError");
          break;
        case 8:
          if (el.querySelector(".d-integrity.warning"))
            sawMutation.current = true;
          success =
            sawMutation.current &&
            pressed("Spread") &&
            !!el.querySelector(".d-integrity.safe");
          break;
        case 9: {
          const n = Number(
            el.querySelector(".d-responsive-button b")?.textContent || 0,
          );
          if (el.querySelector(".d-request-state.loading")) {
            if (loadingBaseline.current === undefined)
              loadingBaseline.current = n;
            if (n > loadingBaseline.current)
              clickedDuringLoading.current = true;
          }
          success =
            clickedDuringLoading.current &&
            !!el.querySelector(".d-request-state.loaded");
          break;
        }
        case 10:
          success =
            pressed("Named") &&
            el
              .querySelector(".d-source")
              ?.textContent?.includes("export function Button") === true;
          break;
        case 11: {
          const boxes = el.querySelectorAll<HTMLInputElement>(
            'input[type="checkbox"]',
          );
          if (Array.from(boxes).some((b) => !b.checked))
            sawMissingPiece.current = true;
          success =
            sawMissingPiece.current &&
            boxes.length === 2 &&
            Array.from(boxes).every((b) => b.checked);
          break;
        }
        case 12:
          success =
            pressed("Stable IDs") &&
            el
              .querySelector(".d-key-row > span")
              ?.textContent?.startsWith("Design") === true &&
            Array.from(
              el.querySelectorAll<HTMLInputElement>(".d-key-row input"),
            ).some(
              (i) =>
                i.value !==
                i.closest(".d-key-row")?.querySelector("span")?.childNodes[0]
                  ?.textContent +
                  " note",
            );
          break;
        case 13:
          success =
            input("Search videos").trim() !== "" &&
            el.querySelectorAll(".d-state-example li").length === 1;
          break;
        case 14:
          success =
            pressed("Server + Suspense") &&
            el.querySelector(".d-stream-frame button")?.textContent ===
              "♥ Saved";
          break;
        case 15:
          success =
            !!el.querySelector(".d-device.phone") &&
            el.querySelector(".d-device-content button")?.textContent ===
              "Explored ✓";
          break;
      }
      if (success) {
        done.current = true;
        latest.current();
      }
    }
    const input = () => {
      interacted.current = true;
      queueMicrotask(check);
    };
    el.addEventListener("click", input);
    el.addEventListener("input", input);
    el.addEventListener("change", input);
    const observer = new MutationObserver(check);
    observer.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    return () => {
      observer.disconnect();
      el.removeEventListener("click", input);
      el.removeEventListener("input", input);
      el.removeEventListener("change", input);
    };
  }, [index]);
  return <div ref={root}>{children}</div>;
}
