export default function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-[2.35rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
