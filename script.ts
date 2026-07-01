import * as fs from 'fs';
const content = fs.readFileSync('src/components/DigitalTwin.tsx', 'utf8');
const startMarker = "      {/* OVERLAY CONSOLE ELEMENTS */}";
const endMarker = "  );\n};\n\nexport default DigitalTwin;";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + `      </div>
      </main>

      <div className="sidebar">
          <div className="panel">
              <div className="panel-title"><span>[03] Launcher Constellation</span></div>
              <p style={{fontSize: '0.7rem', marginBottom: '12px', lineHeight: '1.4'}}>Click any satellite sphere orbiting the globe surface to lock high frequency diagnostic sensors.</p>
              <div className="node-list">
                  <div className={"node-card " + (selectedSat?.name === 'Cartosat-3' ? 'active' : '')} style={{ borderLeftColor: '#2ecc71' }}>
                      <div className="node-info"><h4>Cartosat Payload</h4><p>Imaging</p></div>
                      <div className="node-val" style={{color:'#2ecc71'}}>ONLINE</div>
                  </div>
                  <div className={"node-card " + (selectedSat?.name === 'Resourcesat-2A' ? 'active' : '')} style={{ borderLeftColor: 'var(--color-accent)' }}>
                      <div className="node-info"><h4>Resourcesat Sensor</h4><p>Multichannel</p></div>
                      <div className="node-val">STANDBY</div>
                  </div>
                  <div className={"node-card " + (selectedSat?.name === 'GSAT-29' ? 'active' : '')} style={{ borderLeftColor: '#2ecc71' }}>
                      <div className="node-info"><h4>Gaganyaan Relay</h4><p>Communcation</p></div>
                      <div className="node-val" style={{color:'#2ecc71'}}>STREAMING</div>
                  </div>
              </div>
          </div>
          <div className="panel" style={{flex: 1}}>
              <div className="panel-title"><span>[04] Display Config</span></div>
              <div className="nav-cluster" style={{flexDirection: 'column', width: '100%'}}>
                  <button className={"system-btn " + (indiaMode ? 'primary' : '')} style={{width: '100%'}} onClick={() => {
                        setIndiaMode(!indiaMode);
                        if (!indiaMode) {
                          setCurrentLayer('india_weather');
                        } else {
                          setCurrentLayer('satellites');
                        }
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                      INDIA REGION
                  </button>
                  <button className={"system-btn " + (dayNightMode ? 'primary' : '')} style={{width: '100%'}} onClick={() => setDayNightMode(!dayNightMode)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path></svg>
                      NIGHT OVERLAY
                  </button>
                  <button className={"system-btn " + (cloudsMode ? 'primary' : '')} style={{width: '100%'}} onClick={() => setCloudsMode(!cloudsMode)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path></svg>
                      {cloudsMode ? 'HIDE CLOUDS' : 'SHOW CLOUDS'}
                  </button>
              </div>
          </div>
      </div>

      <div className="controls-bar">
          <button className="system-btn primary" style={{padding: '12px'}} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path></svg>
              )}
          </button>
          <div className="timeline-wrapper">
              <div className="timeline-meta">
                  <span>History (-48h)</span>
                  <span className="time-badge">{Math.abs(timeStep - 50) < 0.5 ? 'LIVE' : \`DEC 2026 : T\${timeStep > 50 ? '+' : '-'}\${(Math.abs(timeStep - 50) * 0.96).toFixed(1)}H\`}</span>
                  <span>Projection (+48h)</span>
              </div>
              <input type="range" className="system-slider" min="0" max="100" step="0.1" value={timeStep} onChange={(e) => setTimeStep(parseFloat(e.target.value))} />
          </div>
          <button className="system-btn" onClick={() => { setTimeStep(50); setIsPlaying(false); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path></svg> 
              RESET
          </button>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-800 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-mono tracking-widest flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  SYSTEM SETTINGS
                </h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Graphics & Rendering</h3>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">Day / Night Cycle</div>
                        <div className="text-[10px] text-gray-500">Enable realistic solar illumination</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDayNightMode(!dayNightMode)}
                      className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${dayNightMode ? 'bg-indigo-500' : 'bg-zinc-700'}\`}
                    >
                      <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${dayNightMode ? 'translate-x-5' : 'translate-x-1'}\`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        <CloudRain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">Real-time Clouds</div>
                        <div className="text-[10px] text-gray-500">Live atmospheric cloud layer</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCloudsMode(!cloudsMode)}
                      className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${cloudsMode ? 'bg-cyan-500' : 'bg-zinc-700'}\`}
                    >
                      <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${cloudsMode ? 'translate-x-5' : 'translate-x-1'}\`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
` + endMarker;

  fs.writeFileSync('src/components/DigitalTwin.tsx', newContent, 'utf8');
  console.log('Replacement successful.');
} else {
  console.log('Markers not found.', startIndex, endIndex);
}
