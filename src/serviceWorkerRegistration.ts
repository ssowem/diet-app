type ServiceWorkerRegistrationLike = {
  update: () => Promise<void> | void;
  waiting?: {
    postMessage: (message: unknown) => void;
  } | null;
};

type ServiceWorkerContainerLike = {
  addEventListener?: (
    event: "controllerchange",
    callback: () => void,
  ) => void;
  register: (
    scriptURL: string,
    options?: RegistrationOptions,
  ) => Promise<ServiceWorkerRegistrationLike>;
};

type RegistrationWindowLike = {
  addEventListener: (event: "load", callback: () => void) => void;
  location: {
    reload: () => void;
  };
};

type RegisterOptions = {
  windowRef?: RegistrationWindowLike;
  navigatorRef?: {
    serviceWorker?: ServiceWorkerContainerLike;
  };
};

export function registerAppServiceWorker(
  baseUrl: string,
  options: RegisterOptions = {},
): void {
  const windowRef = options.windowRef ?? window;
  const navigatorRef = options.navigatorRef ?? navigator;
  const serviceWorker = navigatorRef.serviceWorker;

  if (!serviceWorker) {
    return;
  }

  let hasReloadedForUpdate = false;

  serviceWorker.addEventListener?.("controllerchange", () => {
    if (hasReloadedForUpdate) {
      return;
    }

    hasReloadedForUpdate = true;
    windowRef.location.reload();
  });

  windowRef.addEventListener("load", () => {
    void serviceWorker
      .register(`${baseUrl}sw.js`, {
        scope: baseUrl,
        updateViaCache: "none",
      })
      .then((registration) => {
        void registration.update();
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
  });
}
