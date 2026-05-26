import { describe, expect, test, vi } from "vitest";
import { registerAppServiceWorker } from "./serviceWorkerRegistration";

describe("registerAppServiceWorker", () => {
  test("registers the app service worker without using the browser HTTP cache", () => {
    const update = vi.fn();
    const register = vi.fn(async () => ({ update }));
    const addWindowListener = vi.fn((event: string, callback: () => void) => {
      if (event === "load") {
        callback();
      }
    });
    const addServiceWorkerListener = vi.fn();

    registerAppServiceWorker("/diet-app/", {
      windowRef: {
        addEventListener: addWindowListener,
        location: {
          reload: vi.fn(),
        },
      },
      navigatorRef: {
        serviceWorker: {
          addEventListener: addServiceWorkerListener,
          register,
        },
      },
    });

    expect(register).toHaveBeenCalledWith("/diet-app/sw.js", {
      scope: "/diet-app/",
      updateViaCache: "none",
    });
  });
});
