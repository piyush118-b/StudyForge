"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Category = {
  category: string;
  options: string[];
}

interface CategorizedComboboxProps {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  emptyText: string;
  onCustomAdd?: () => void;
  customAddText?: string;
}

export function CategorizedCombobox({
  categories,
  value,
  onChange,
  placeholder,
  emptyText,
  onCustomAdd,
  customAddText
}: CategorizedComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Flatten options for easy lookup just in case it's selected
  const allOptions = categories.flatMap(c => c.options);
  const selectedDisplay = allOptions.find((opt) => opt === value) || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-900/50 border-white/5 text-white font-medium hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all rounded-2xl h-14 md:h-16 px-6 text-lg"
        >
          <span className="truncate">{selectedDisplay ? selectedDisplay : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-40 group-hover:opacity-100" />
        </Button>
      } />
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#0F172A] border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command className="bg-[#0F172A] text-white">
          <CommandInput placeholder={placeholder} className="text-white h-12" />
          <CommandList className="max-h-[350px] custom-scrollbar focus:ring-0">
            <CommandEmpty className="py-8 text-center text-sm text-slate-500">
              {emptyText}
            </CommandEmpty>
            <div className="p-2 space-y-1">
              {categories.map((group) => (
                <CommandGroup key={group.category} heading={group.category} className="text-slate-400">
                  {group.options.map((opt) => (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => {
                        onChange(opt)
                        setOpen(false)
                      }}
                      className="text-white hover:bg-indigo-500/10 cursor-pointer rounded-xl h-11 px-3 mt-1"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-indigo-400",
                          value === opt ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="font-medium">{opt}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {onCustomAdd && customAddText && (
                <CommandGroup className="mt-2 border-t border-white/5 pt-2">
                  <CommandItem
                    onSelect={() => {
                      onCustomAdd()
                      setOpen(false)
                    }}
                    className="text-indigo-400 font-bold cursor-pointer hover:bg-indigo-500/10 rounded-xl h-11 px-3"
                  >
                    {customAddText}
                  </CommandItem>
                </CommandGroup>
              )}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
