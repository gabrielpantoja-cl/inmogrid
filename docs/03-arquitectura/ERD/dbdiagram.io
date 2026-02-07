// dbdiagram.io
Table User {
  id            String [pk]
  name          String
  email         String [unique]
  password      String
  emailVerified DateTime
  image         String
  createdAt     DateTime
  updatedAt     DateTime
  role          String
}

Table Account {
  id                String [pk]
  userId            String [ref: > User.id]
  type              String
  provider          String
  providerAccountId String
  refresh_token     String
  access_token      String
  expires_at        Int
  token_type        String
  scope             String
  id_token          String
  session_state     String
  createdAt         DateTime
  updatedAt         DateTime
}

Table Session {
  id           String [pk]
  sessionToken String [unique]
  userId       String [ref: > User.id]
  expires      DateTime
}

Table AuditLog {
  id        String [pk]
  userId    String [ref: > User.id]
  action    String
  metadata  Json
  createdAt DateTime
}

Table referenciales {
  id             String [pk]
  lat            Float
  lng            Float
  fojas          String
  numero         Int
  anio           Int
  cbr            String
  comprador      String
  vendedor       String
  predio         String
  comuna         String
  rol            String
  fechaescritura DateTime
  superficie     Float
  monto          Int
  observaciones  String
  userId         String [ref: > User.id]
  geom           String
}

Table VerificationToken {
  identifier String [pk]
  token      String [pk]
  expires    DateTime
}

Table spatial_ref_sys {
  srid      Int [pk]
  auth_name String
  auth_srid Int
  srtext    String
  proj4text String
}