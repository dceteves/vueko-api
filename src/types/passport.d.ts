import type { Provider } from "./passport.types.ts";

declare module "passport" {
  interface Profile {
    provider: Provider;
  }
}
