import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__.js";

import { __nullable__ } from "./__nullable__.js";

export const SessionPlain = t.Object(
  {
    id: t.String(),
    expiresAt: t.Date(),
    token: t.String(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    ipAddress: __nullable__(t.String()),
    userAgent: __nullable__(t.String()),
    userId: t.String(),
    impersonatedBy: __nullable__(t.String()),
  },
  { additionalProperties: false },
);

export const SessionRelations = t.Object(
  {
    user: t.Object(
      {
        id: t.String(),
        name: t.String(),
        email: t.String(),
        emailVerified: t.Boolean(),
        image: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        role: __nullable__(
          t.Union([t.Literal("admin"), t.Literal("user")], {
            additionalProperties: false,
          }),
        ),
        banned: __nullable__(t.Boolean()),
        banReason: __nullable__(t.String()),
        banExpires: __nullable__(t.Date()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const SessionPlainInputCreate = t.Object(
  {
    expiresAt: t.Date(),
    token: t.String(),
    ipAddress: t.Optional(__nullable__(t.String())),
    userAgent: t.Optional(__nullable__(t.String())),
    impersonatedBy: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const SessionPlainInputUpdate = t.Object(
  {
    expiresAt: t.Optional(t.Date()),
    token: t.Optional(t.String()),
    ipAddress: t.Optional(__nullable__(t.String())),
    userAgent: t.Optional(__nullable__(t.String())),
    impersonatedBy: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const SessionRelationsInputCreate = t.Object(
  {
    user: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const SessionRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const SessionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          expiresAt: t.Date(),
          token: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          ipAddress: t.String(),
          userAgent: t.String(),
          userId: t.String(),
          impersonatedBy: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "Session" },
  ),
);

export const SessionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), token: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.String() }), t.Object({ token: t.String() })],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              expiresAt: t.Date(),
              token: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              ipAddress: t.String(),
              userAgent: t.String(),
              userId: t.String(),
              impersonatedBy: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Session" },
);

export const SessionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      expiresAt: t.Boolean(),
      token: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      ipAddress: t.Boolean(),
      userAgent: t.Boolean(),
      userId: t.Boolean(),
      impersonatedBy: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SessionInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const SessionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      token: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ipAddress: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userAgent: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      impersonatedBy: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Session = t.Composite([SessionPlain, SessionRelations], {
  additionalProperties: false,
});

export const SessionInputCreate = t.Composite(
  [SessionPlainInputCreate, SessionRelationsInputCreate],
  { additionalProperties: false },
);

export const SessionInputUpdate = t.Composite(
  [SessionPlainInputUpdate, SessionRelationsInputUpdate],
  { additionalProperties: false },
);
