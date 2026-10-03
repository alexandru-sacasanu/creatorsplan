import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

export default function KeyInput({ onKeySet, savedKey }) {
    const [key, setKey] = useState(savedKey || '');
    const [isVisible, setIsVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(!!savedKey);

    useEffect(() => {
        if (savedKey) setKey(savedKey);
    }, [savedKey]);

    const handleSave = () => {
        if (key.trim().length > 0) {
            onKeySet(key);
            setIsSaved(true);
        }
    };

    return (
        <div className="space-y-2">
            <label htmlFor="gemini-key" className="cp-label block">Gemini API key</label>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative sm:flex-1">
                    <input
                        id="gemini-key"
                        type={isVisible ? "text" : "password"}
                        value={key}
                        onChange={(e) => {
                            setKey(e.target.value);
                            setIsSaved(false);
                        }}
                        placeholder="AIzaSy..."
                        className="input-field pr-12 font-cp-mono"
                    />
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        aria-label={isVisible ? "hide key" : "show key"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cp-ink-2 hover:text-cp-ink transition-colors"
                    >
                        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!key || isSaved}
                    className={isSaved ? 'badge-ok px-4 self-center cursor-default' : 'btn-quiet px-5 shrink-0'}
                >
                    {isSaved ? <><Check size={14} /> ready</> : 'Save key'}
                </button>
            </div>
            <p className="cp-help">
                Stored in your browser.{' '}
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cp-ink underline underline-offset-[3px]"
                >
                    Get a free Gemini key →
                </a>
            </p>
        </div>
    );
}
