import React, { useState, useEffect } from 'react';
import { Film, Download, Copy, Check, Loader2, Play, User } from 'lucide-react';
import { getApiUrl } from '../config';
import SegmentedControl from './ui/SegmentedControl';
import Modal from './ui/Modal';
import { ScreenHeader } from './ui/Screen';

export default function UGCGallery() {
  const [tab, setTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [avatarsLoaded, setAvatarsLoaded] = useState(false);
  const [copied, setCopied] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoadingVideos(true);
    fetch(getApiUrl('/api/saasshorts/gallery?limit=100'))
      .then((r) => (r.ok ? r.json() : { videos: [] }))
      .then((d) => setVideos(d.videos || []))
      .catch(() => {})
      .finally(() => setLoadingVideos(false));
  }, []);

  useEffect(() => {
    if (tab !== 'avatars' || avatarsLoaded) return;
    setLoadingAvatars(true);
    fetch(getApiUrl('/api/saasshorts/actor-gallery'))
      .then((r) => (r.ok ? r.json() : { images: [] }))
      .then((d) => setAvatars(d.images || []))
      .catch(() => {})
      .finally(() => {
        setLoadingAvatars(false);
        setAvatarsLoaded(true);
      });
  }, [tab, avatarsLoaded]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const loading = (tab === 'videos' && loadingVideos) || (tab === 'avatars' && loadingAvatars);

  return (
    <div>
      <ScreenHeader
        eyebrow="04 · GALLERY"
        title="Everything you've made"
        subtitle={`${loadingVideos ? '…' : videos.length} AI shorts${avatarsLoaded ? ` · ${avatars.length} presenters` : ''}`}
        actions={(
          <div className="w-full sm:w-60">
            <SegmentedControl
              size="sm"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'videos', label: 'AI shorts' },
                { value: 'avatars', label: 'Presenters' },
              ]}
            />
          </div>
        )}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={20} className="animate-spin text-cp-ink-2" />
          <span className="ml-2 text-cp-ink-2">Loading the gallery…</span>
        </div>
      ) : tab === 'videos' ? (
        videos.length === 0 ? (
          <div className="text-center py-16">
            <Film size={40} className="mx-auto text-muted opacity-40 mb-3" />
            <p className="text-sm text-cp-ink-2">Nothing here yet. Make one in AI shorts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {videos.map((video, i) => (
              <VideoCard
                i={i}
                key={video.video_id}
                video={video}
                copied={copied}
                onCopy={handleCopy}
                onOpen={() => setSelected(video)}
              />
            ))}
          </div>
        )
      ) : avatars.length === 0 ? (
        <div className="text-center py-16">
          <User size={40} className="mx-auto text-muted opacity-40 mb-3" />
          <p className="text-sm text-cp-ink-2">No presenters yet. Create one in AI shorts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {avatars.map((avatar, i) => (
            <AvatarCard key={avatar.key || i} i={i} avatar={avatar} copied={copied} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          size="sm"
          eyebrow={selected.video_mode === 'lowcost' ? 'LOW COST' : 'PREMIUM'}
          title={selected.title || 'Untitled'}
        >
          <video
            src={selected.video_url}
            poster={selected.actor_url}
            controls
            autoPlay
            playsInline
            className="w-full rounded-input bg-black aspect-[9/16] object-contain max-h-[60vh]"
          />
          <p className="readout mt-3">
            {selected.duration?.toFixed(0)}s
            {selected.cost_estimate?.total != null ? ` · $${selected.cost_estimate.total.toFixed(2)}` : ''}
          </p>
          {selected.caption && (
            <p className="text-sm text-muted mt-2 leading-relaxed">{selected.caption}</p>
          )}
          <a
            href={selected.video_url}
            download
            className="btn-ghost w-full mt-4 justify-center text-sm"
          >
            <Download size={14} /> Download
          </a>
        </Modal>
      )}
    </div>
  );
}

function AvatarCard({ avatar, copied, onCopy, i = 0 }) {
  return (
    <div className="group cp-rise flex flex-col gap-2" style={{ '--cp-i': Math.min(i, 12) }}>
      <div className="aspect-[3/4] rounded-cp-select overflow-hidden cp-placeholder border-[1.5px] border-transparent transition-[border-color,transform] duration-[var(--cp-dur-settle)] ease-cp-settle group-hover:border-cp-ink group-hover:-translate-y-0.5">
        <img src={avatar.url} alt="Presenter" loading="lazy" decoding="async" className="w-full h-full object-cover" />
      </div>
      <div className="space-y-1.5">
        {avatar.description ? (
          <div className="relative pr-4">
            <p className="text-micro text-muted line-clamp-2">{avatar.description}</p>
            <button
              type="button"
              onClick={() => onCopy(avatar.description, `avatar-${avatar.key}`)}
              className="absolute top-0 right-0 p-0.5 text-muted hover:text-brass transition-colors"
              title="Copy prompt"
            >
              {copied === `avatar-${avatar.key}` ? <Check size={10} className="text-ok" /> : <Copy size={10} />}
            </button>
          </div>
        ) : (
          <p className="text-micro text-muted opacity-60">No description</p>
        )}
        <a
          href={avatar.url}
          download
          className="inline-flex items-center gap-1 text-xs text-cp-ink underline underline-offset-[3px]"
        >
          <Download size={11} /> Download
        </a>
      </div>
    </div>
  );
}

function VideoCard({ video, copied, onCopy, onOpen, i = 0 }) {
  const mode = video.video_mode;
  const caption = video.caption || '';
  const hashtags = (video.hashtags || []).join(' ');

  return (
    <div className="group cp-rise flex flex-col gap-2" style={{ '--cp-i': Math.min(i, 12) }}>
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[9/16] w-full p-0 rounded-cp-select border-[1.5px] border-transparent cp-placeholder overflow-hidden cursor-pointer transition-[border-color,transform] duration-[var(--cp-dur-settle)] ease-cp-settle hover:border-cp-ink hover:-translate-y-0.5"
      >
        {video.actor_url ? (
          <img
            src={video.actor_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-11 h-11 rounded-full bg-cp-ink text-cp-paper flex items-center justify-center"><Play size={18} className="ml-0.5" /></span>
        </div>
        <span className="absolute top-2 left-2 font-cp-mono text-[10px] font-medium tracking-[0.05em] uppercase bg-cp-paper text-cp-ink px-2 py-0.5 rounded-cp-chip">
          {mode === 'lowcost' ? 'Standard' : 'Premium'}
        </span>
        {Number.isFinite(video.duration) && (
          <span className="absolute bottom-2 right-2 font-cp-mono text-[10px] font-medium bg-cp-ink text-cp-paper px-2 py-0.5 rounded-cp-chip">
            0:{String(Math.round(video.duration)).padStart(2, '0')}
          </span>
        )}
      </button>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-cp-ink truncate">{video.title || 'Untitled'}</h3>
        <p className="text-xs text-cp-ink-2">
          {video.cost_estimate?.total != null ? `$${video.cost_estimate.total.toFixed(2)}` : 'AI short'}
        </p>
        {caption && (
          <div className="relative pr-4">
            <p className="text-micro text-muted line-clamp-2">{caption}</p>
            <button
              type="button"
              onClick={() => onCopy(`${caption}\n${hashtags}`, `caption-${video.video_id}`)}
              className="absolute top-0 right-0 p-0.5 text-muted hover:text-brass transition-colors"
              title="Copy caption"
            >
              {copied === `caption-${video.video_id}` ? <Check size={10} className="text-ok" /> : <Copy size={10} />}
            </button>
          </div>
        )}
        <a
          href={video.video_url}
          download
          className="inline-flex items-center gap-1 text-xs text-cp-ink underline underline-offset-[3px]"
        >
          <Download size={11} /> Download
        </a>
      </div>
    </div>
  );
}
