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
          className="w-full justify-between bg-slate-900 border-white/20 text-white font-normal hover:bg-slate-800"
        >
          <span className="truncate">{selectedDisplay ? selectedDisplay : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      } />
      <PopoverContent className="w-full sm:w-[500px] p-0 bg-slate-900 border-white/20">
        <Command className="bg-slate-900 text-white">
          <CommandInput placeholder={placeholder} className="text-white" />
          <CommandList className="max-h-[300px] custom-scrollbar">
            <CommandEmpty className="py-6 text-center text-sm text-slate-400">
              {emptyText}
            </CommandEmpty>
            {categories.map((group) => (
              <CommandGroup key={group.category} heading={group.category} className="text-slate-400">
                {group.options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={(currentValue) => {
                      onChange(opt)
                      setOpen(false)
                    }}
                    className="text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {onCustomAdd && customAddText && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onCustomAdd()
                    setOpen(false)
                  }}
                  className="text-teal-400 font-semibold cursor-pointer hover:bg-teal-900/20"
                >
                  {customAddText}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
