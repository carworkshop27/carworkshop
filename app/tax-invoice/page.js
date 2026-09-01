"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TaxInvoice from "../../components/tax-invoices/TaxInvoice";

function TaxInvoiceContent() {
  const searchParams = useSearchParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = () => {
      try {
        const jobsData = localStorage.getItem("autofix_offline_db");

        if (!jobsData) {
          setLoading(false);
          return;
        }

        const jobs = JSON.parse(jobsData);

        const jobId = searchParams.get("jobId");

        if (jobId) {
          const selectedJob = jobs.find((j) => j.id === jobId);

          if (selectedJob) {
            setJob(selectedJob);
            setLoading(false);
            return;
          }
        }

        const selectedJobId = localStorage.getItem("autofix_selected_job_id");

        if (selectedJobId) {
          const selectedJob = jobs.find((j) => j.id === selectedJobId);

          if (selectedJob) {
            setJob(selectedJob);
            setLoading(false);
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load tax invoice job:", error);
        setJob(null);
        setLoading(false);
      }
    };

    const timer = setTimeout(loadJob, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const getDamageInfo = (status) => {
    const damageMap = {
      scratch: {
        label: "Scratch",
        cost: 0,
      },

      large_dent: {
        label: "Large Dent",
        cost: 0,
      },

      replace: {
        label: "Replace",
        cost: 0,
      },

      light_damage: {
        label: "Light Damage",
        cost: 0,
      },

      medium_damage: {
        label: "Medium Damage",
        cost: 0,
      },

      large_damage: {
        label: "Large Damage",
        cost: 0,
      },

      polish: {
        label: "Polish",
        cost: 0,
      },
    };

    return (
      damageMap[status] || {
        label: status || "N/A",
        cost: 0,
      }
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="bg-white p-8 text-center rounded-xl">
          Loading tax invoice...
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="bg-white p-8 text-center rounded-xl">
          <h2 className="text-xl font-bold text-slate-900">Job not found</h2>

          <p className="text-sm text-slate-500 mt-2">
            No job was found for this tax invoice.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <TaxInvoice
        job={job}
        getDamageInfo={getDamageInfo}
        onPrint={() => window.print()}
      />
    </main>
  );
}

export default function TaxInvoicePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 p-6">
          <div className="bg-white p-8 text-center rounded-xl">
            Loading tax invoice...
          </div>
        </main>
      }
    >
      <TaxInvoiceContent />
    </Suspense>
  );
}
