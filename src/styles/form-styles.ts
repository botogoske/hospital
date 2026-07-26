// Shared form styles for hospital dashboard pages
// Import and use these constants to maintain consistent styling across all forms

export const formStyles = {
  // Dialog styles
  dialog: {
    content: "max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none",
    header: "border-b border-[#222222] px-6 py-4",
    title: "font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]",
  },

  // Form field styles
  field: {
    wrapper: "space-y-1.5",
    label: "font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]",
    input: "rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0",
    select: "flex w-full border border-[#333333] bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none",
    error: "font-mono text-[10px] uppercase text-[#E61919]",
  },

  // Button styles
  button: {
    primary: "w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10",
    trigger: "flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]",
    export: "flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors",
    edit: "flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors",
    delete: "flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors",
  },

  // Table styles
  table: {
    headerRow: "border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]",
    headerCell: "font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium",
    bodyRow: "border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors",
    cell: "font-mono text-[11px] text-[#EAEAEA]",
    cellBold: "font-mono text-[11px] font-bold text-[#EAEAEA]",
    cellMuted: "font-mono text-[11px] uppercase text-[#777777]",
    emptyState: "py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]",
  },

  // Search input styles
  search: {
    wrapper: "relative",
    icon: "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]",
    input: "w-full border border-[#222222] bg-[#0D0D0D] py-1.5 pl-9 pr-3 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:outline-none rounded-none",
  },

  // Page header styles
  header: {
    container: "border border-[#222222] bg-[#111111] p-6",
    row: "flex items-center justify-between",
    iconBox: "flex h-10 w-10 items-center justify-center bg-[#E61919] text-white",
    title: "text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none",
    subtitle: "font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1",
  },

  // Stats grid styles
  stats: {
    container: "grid gap-px bg-[#222222] border border-[#222222] sm:grid-cols-4",
    item: "bg-[#111111] p-4 text-center",
    value: "font-mono text-2xl font-bold",
    label: "font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] mt-1",
  },

  // Page section styles
  section: {
    container: "border border-[#222222] bg-[#111111]",
    header: "border-b border-[#222222] px-6 py-4 space-y-3",
    title: "font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]",
  },
} as const;

// Color constants for status badges
export const statusColors = {
  available: "border-l-[#4AF626]",
  occupied: "border-l-[#E61919]",
  maintenance: "border-l-[#E61919]",
  reserved: "border-l-[#555555]",
  discharged: "border-l-[#4AF626]",
  active: "border-l-[#E61919]",
  scheduled: "border-l-[#555555]",
} as const;

// Common status badge style
export const statusBadgeStyle = "inline-block border-l-2 pl-2 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA]";
