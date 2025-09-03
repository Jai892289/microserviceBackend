-- CreateTable
CREATE TABLE "public"."Services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_services" (
    "id" SERIAL NOT NULL,
    "empId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_services_empId_serviceId_key" ON "public"."user_services"("empId", "serviceId");

-- AddForeignKey
ALTER TABLE "public"."user_services" ADD CONSTRAINT "user_services_empId_fkey" FOREIGN KEY ("empId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_services" ADD CONSTRAINT "user_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
