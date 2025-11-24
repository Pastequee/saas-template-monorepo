import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__.js";

import { __nullable__ } from "./__nullable__.js";

export const TodoStatus = t.Union(
  [t.Literal("pending"), t.Literal("completed")],
  { additionalProperties: false },
);
