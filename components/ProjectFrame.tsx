import type { Project } from '@/lib/projects';

/**
 * Browser window with a project's real screen recording. Videos load only when
 * scrolled into view (preload none + play/pause observer in <Effects/>).
 * `manual` = slide index when a parent (the Work slider) controls playback instead.
 */
export default function ProjectFrame({ p, className = '', manual }: { p: Project; className?: string; manual?: number }) {
  const src = p.media;
  const video = (
    <video data-manual={manual != null ? '' : undefined} data-i={manual} muted loop playsInline preload="none" poster={`${src}.webp`} aria-label={p.title}
      style={p.crop ? { position: 'absolute', left: p.crop.left, top: p.crop.top, width: p.crop.width, height: 'auto' } : undefined}>
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
  return (
    <div className={`pj-frame ${className}`}>
      <div className="pj-bar" aria-hidden="true">
        <span className="pj-dots"><span /><span /><span /></span>
        <span className="pj-url">{p.domain}</span>
      </div>
      <div className="pj-shot" style={{ aspectRatio: p.crop ? p.crop.aspect : '800 / 433', overflow: 'hidden' }}>{video}</div>
    </div>
  );
}
