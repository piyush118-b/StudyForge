export function SidebarProperties({ blockId, onClose, variant }: { blockId: string, onClose: () => void, variant?: 'editor' | 'dashboard' }) {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-[#111111] border-l border-[#2A2A2A] overflow-hidden h-full">

      {/* Panel header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#2A2A2A] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#F0F0F0]">Block Properties</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#606060] hover:text-[#F0F0F0] hover:bg-[#222222] transition-all duration-150"
        >
          ✕
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <p className="text-xs text-[#606060] leading-relaxed">
          Select a block on the canvas to edit its properties here.
          <br /><br />
          Block ID: <span className="font-mono text-[#A0A0A0]">{blockId}</span>
        </p>
      </div>

    </aside>
  )
}
