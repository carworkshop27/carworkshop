"use client";

import StandaloneSalesInvoice from "./StandaloneSalesInvoice";

export default function PartnerWorkshopSalesInvoice(props) {
  return (
    <StandaloneSalesInvoice
      {...props}
      template="partner-workshop"
    />
  );
}
