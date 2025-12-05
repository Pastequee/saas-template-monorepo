import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__.js";

import { __nullable__ } from "./__nullable__.js";

export const Role = t.Union(
  [t.Literal("user"), t.Literal("admin"), t.Literal("superadmin")],
  { additionalProperties: false },
);
