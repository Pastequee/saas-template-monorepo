import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__.js";

import { __nullable__ } from "./__nullable__.js";

export const AccountPlain = t.Object(
  {
    id: t.String(),
    accountId: t.String(),
    providerId: t.String(),
    userId: t.String(),
    accessToken: __nullable__(t.String()),
    refreshToken: __nullable__(t.String()),
    idToken: __nullable__(t.String()),
    accessTokenExpiresAt: __nullable__(t.Date()),
    refreshTokenExpiresAt: __nullable__(t.Date()),
    scope: __nullable__(t.String()),
    password: __nullable__(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const AccountRelations = t.Object(
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

export const AccountPlainInputCreate = t.Object(
  {
    accessToken: t.Optional(__nullable__(t.String())),
    refreshToken: t.Optional(__nullable__(t.String())),
    idToken: t.Optional(__nullable__(t.String())),
    accessTokenExpiresAt: t.Optional(__nullable__(t.Date())),
    refreshTokenExpiresAt: t.Optional(__nullable__(t.Date())),
    scope: t.Optional(__nullable__(t.String())),
    password: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AccountPlainInputUpdate = t.Object(
  {
    accessToken: t.Optional(__nullable__(t.String())),
    refreshToken: t.Optional(__nullable__(t.String())),
    idToken: t.Optional(__nullable__(t.String())),
    accessTokenExpiresAt: t.Optional(__nullable__(t.Date())),
    refreshTokenExpiresAt: t.Optional(__nullable__(t.Date())),
    scope: t.Optional(__nullable__(t.String())),
    password: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AccountRelationsInputCreate = t.Object(
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

export const AccountRelationsInputUpdate = t.Partial(
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

export const AccountWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          accountId: t.String(),
          providerId: t.String(),
          userId: t.String(),
          accessToken: t.String(),
          refreshToken: t.String(),
          idToken: t.String(),
          accessTokenExpiresAt: t.Date(),
          refreshTokenExpiresAt: t.Date(),
          scope: t.String(),
          password: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Account" },
  ),
);

export const AccountWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
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
              accountId: t.String(),
              providerId: t.String(),
              userId: t.String(),
              accessToken: t.String(),
              refreshToken: t.String(),
              idToken: t.String(),
              accessTokenExpiresAt: t.Date(),
              refreshTokenExpiresAt: t.Date(),
              scope: t.String(),
              password: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Account" },
);

export const AccountSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      accountId: t.Boolean(),
      providerId: t.Boolean(),
      userId: t.Boolean(),
      accessToken: t.Boolean(),
      refreshToken: t.Boolean(),
      idToken: t.Boolean(),
      accessTokenExpiresAt: t.Boolean(),
      refreshTokenExpiresAt: t.Boolean(),
      scope: t.Boolean(),
      password: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AccountInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AccountOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      accountId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      providerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      accessToken: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      refreshToken: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      idToken: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      accessTokenExpiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      refreshTokenExpiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      scope: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      password: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Account = t.Composite([AccountPlain, AccountRelations], {
  additionalProperties: false,
});

export const AccountInputCreate = t.Composite(
  [AccountPlainInputCreate, AccountRelationsInputCreate],
  { additionalProperties: false },
);

export const AccountInputUpdate = t.Composite(
  [AccountPlainInputUpdate, AccountRelationsInputUpdate],
  { additionalProperties: false },
);
