import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Quote, Play } from "lucide-react";
import { api, type TestimonialRecord } from "@/lib/api-client";
import { getInitials, getVideoEmbedUrl } from "@/lib/testimonials";
import { SectionHeader } from "./Strategies";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

function TestimonialMedia({ item }: { item: TestimonialRecord }) {
  if (item.mediaType === "image" && item.mediaUrl) {
    return (
      <img
        src={item.mediaUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full border-2 border-primary/40 object-cover shadow-[0_0_20px_-6px_var(--gold)]"
      />
    );
  }

  if (item.mediaType === "video" && item.mediaUrl) {
    const embed = getVideoEmbedUrl(item.mediaUrl);
    if (embed) {
      return (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/40 shadow-[0_0_20px_-6px_var(--gold)]">
          <iframe
            src={embed}
            title={`${item.name} video testimonial`}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          />
          <div className="absolute inset-0 grid place-items-center bg-black/35">
            <Play className="h-5 w-5 text-primary" />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-primary/40 bg-primary/10 text-sm font-bold text-primary shadow-[0_0_20px_-6px_var(--gold)]">
      {getInitials(item.name)}
    </div>
  );
}

function TestimonialCard({ item, index }: { item: TestimonialRecord; index: number }) {
  const embed = item.mediaType === "video" && item.mediaUrl ? getVideoEmbedUrl(item.mediaUrl) : null;

  return (
    <article
      className="group relative h-full rounded-2xl border border-border/80 bg-surface/90 p-5 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-[0_20px_50px_-24px_var(--gold)] sm:p-6"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"
      />
      <Quote className="h-8 w-8 text-primary/50" aria-hidden />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">&ldquo;{item.content}&rdquo;</p>

      {item.mediaType === "video" && embed && (
        <div className="mt-5 overflow-hidden rounded-xl border border-border/70 aspect-video">
          <iframe
            src={embed}
            title={`${item.name} testimonial video`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
        <TestimonialMedia item={item} />
        <div>
          <div className="font-bold text-foreground">{item.name}</div>
          <div className="text-xs text-primary">Verified client</div>
        </div>
      </div>
    </article>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["testimonials", "public"],
    queryFn: () => api.testimonials.list(),
  });

  const testimonials = data?.testimonials ?? [];

  useEffect(() => {
    if (!carouselApi || testimonials.length <= 1) return;
    carouselApi.reInit();
  }, [carouselApi, testimonials]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !carouselApi) return;

    const reInit = () => {
      window.requestAnimationFrame(() => carouselApi.reInit());
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reInit();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    window.addEventListener("resize", reInit);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", reInit);
    };
  }, [carouselApi]);

  return (
    <section ref={sectionRef} id="testimonials" className="relative overflow-hidden py-10 lg:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="TESTIMONIALS"
          title="Trusted by Serious Traders"
          subtitle="Real feedback from clients who value research, discipline, and a balanced view of the market."
        />

        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading testimonials…</p>
          </div>
        ) : isError ? (
          <p className="mt-12 text-center text-sm text-destructive">Could not load testimonials. Please try again later.</p>
        ) : testimonials.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">No testimonials published yet.</p>
        ) : testimonials.length === 1 ? (
          <div className="mx-auto mt-12 max-w-xl">
            <TestimonialCard item={testimonials[0]} index={0} />
          </div>
        ) : (
          <div className="relative mt-12 px-4 sm:px-10 md:px-14">
            <Carousel
              setApi={setCarouselApi}
              opts={{ align: "start", loop: true, containScroll: "trimSnaps" }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 py-2 sm:-ml-4">
                {testimonials.map((item, index) => (
                  <CarouselItem
                    key={item.id}
                    className="basis-[92%] py-2 pl-3 sm:basis-[88%] sm:pl-4 md:basis-[52%] lg:basis-[42%] xl:basis-[34%]"
                  >
                    <TestimonialCard item={item} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 z-20 h-8 w-8 border-primary/30 bg-surface/90 hover:border-primary/50 hover:bg-surface sm:-left-2 sm:h-9 sm:w-9" />
              <CarouselNext className="right-0 z-20 h-8 w-8 border-primary/30 bg-surface/90 hover:border-primary/50 hover:bg-surface sm:-right-2 sm:h-9 sm:w-9" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
