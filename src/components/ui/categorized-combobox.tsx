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
          className="w-full justify-between bg-forge-elevated border-forge-border text-forge-text-primary font-medium hover:bg-forge-overlay hover:border-forge-muted transition-all h-11 px-4 text-sm shadow-sm"
        >
          <span className="truncate">{selectedDisplay ? selectedDisplay : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100" />
        </Button>
      } />
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-forge-elevated border-forge-border shadow-forge-xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command className="bg-transparent text-forge-text-primary">
          <CommandInput placeholder={placeholder} className="text-forge-text-primary h-11" />
          <CommandList className="max-h-[350px] custom-scrollbar focus:ring-0">
            <CommandEmpty className="py-8 text-center text-sm text-forge-text-muted">
              {emptyText}
            </CommandEmpty>
            <div className="p-1.5 space-y-1">
              {categories.map((group) => (
                <CommandGroup key={group.category} heading={group.category} className="text-forge-text-secondary">
                  {group.options.map((opt) => (
                    <CommandItem
                      key={opt}
                      value={opt}
                      onSelect={() => {
                        onChange(opt)
                        setOpen(false)
                      }}
                      className="text-forge-text-primary hover:bg-forge-overlay cursor-pointer rounded-lg h-10 px-3 mt-1"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-forge-accent",
                          value === opt ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="font-medium">{opt}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {onCustomAdd && customAddText && (
                <CommandGroup className="mt-2 border-t border-forge-border pt-2">
                  <CommandItem
                    onSelect={() => {
                      onCustomAdd()
                      setOpen(false)
                    }}
                    className="text-forge-accent font-semibold flex items-center justify-center cursor-pointer hover:bg-forge-overlay rounded-lg h-10 px-3"
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
