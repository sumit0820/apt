import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { contactSchema, type ContactFormValues } from "@/lib/form-schemas";
import { FormIconField, FormTextareaField } from "@/components/forms/form-fields";
import { Form } from "@/components/ui/form";
import { SectionHeader } from "./Strategies";

export function Contact() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    try {
      const res = await api.contact.submit(values);
      toast.success(res.message ?? "Thanks — our team will reach out shortly.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <section id="contact" className="py-10 lg:py-14 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="CONTACT US"
          title="Talk to our team."
          subtitle="Questions about a strategy, your plan, or onboarding? Reach us on your preferred channel."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ContactCard icon={MessageCircle} title="WhatsApp" value="+91 99999 99999" href="https://wa.me/919999999999" />
            <ContactCard icon={Phone} title="Call us" value="+91 99999 99999" href="tel:+919999999999" />
            <ContactCard icon={Mail} title="Email" value="support@apexprotraders.in" href="mailto:support@apexprotraders.in" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-surface p-6 space-y-4">
              <FormIconField control={form.control} name="name" label="Your name" placeholder="Jane Doe" />
              <FormIconField control={form.control} name="email" type="email" label="Email" placeholder="you@example.com" />
              <FormTextareaField control={form.control} name="message" label="Message" placeholder="How can we help?" />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon: Icon, title, value, href }: { icon: typeof Mail; title: string; value: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/40">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="break-all font-bold sm:break-normal">{value}</div>
      </div>
    </a>
  );
}
