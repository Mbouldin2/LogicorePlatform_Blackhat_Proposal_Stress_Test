"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconSelector } from "./IconSelector";

interface BaseItem {
  id: string;
}

interface DynamicListEditorProps<T extends BaseItem> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, updateItem: (updates: Partial<T>) => void) => React.ReactNode;
  createNewItem: () => T;
  title?: string;
  addButtonText?: string;
  maxItems?: number;
  minItems?: number;
  emptyMessage?: string;
}

export function DynamicListEditor<T extends BaseItem>({
  items,
  onChange,
  renderItem,
  createNewItem,
  title,
  addButtonText = "Add Item",
  maxItems,
  minItems = 0,
  emptyMessage = "No items added yet",
}: DynamicListEditorProps<T>) {
  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;
    onChange([...items, createNewItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= minItems) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<T>) => {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">{title}</Label>
          <span className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
            {maxItems && ` / ${maxItems} max`}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id} className="relative">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center h-6 w-6">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    {renderItem(item, index, (updates) => updateItem(index, updates))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= minItems}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        disabled={maxItems !== undefined && items.length >= maxItems}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addButtonText}
      </Button>
    </div>
  );
}

interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface BenefitListEditorProps {
  benefits: BenefitItem[];
  onChange: (benefits: BenefitItem[]) => void;
  title?: string;
}

export function BenefitListEditor({
  benefits,
  onChange,
  title = "Benefits",
}: BenefitListEditorProps) {
  return (
    <DynamicListEditor
      items={benefits}
      onChange={onChange}
      title={title}
      addButtonText="Add Benefit"
      emptyMessage="No benefits added yet. Add benefits to highlight key features."
      createNewItem={() => ({
        id: `benefit-${Date.now()}`,
        icon: "CheckCircle",
        title: "",
        description: "",
      })}
      renderItem={(item, _index, updateItem) => (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <IconSelector
              label="Icon"
              value={item.icon}
              onChange={(icon) => updateItem({ icon })}
            />
            <div>
              <Label>Title</Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem({ title: e.target.value })}
                placeholder="Benefit title"
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={item.description}
              onChange={(e) => updateItem({ description: e.target.value })}
              placeholder="Describe this benefit..."
              rows={2}
            />
          </div>
        </div>
      )}
    />
  );
}

interface SimpleListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  title?: string;
  placeholder?: string;
  addButtonText?: string;
}

export function SimpleListEditor({
  items,
  onChange,
  title = "Items",
  placeholder = "Enter item...",
  addButtonText = "Add Item",
}: SimpleListEditorProps) {
  const wrappedItems = items.map((text, i) => ({ id: `item-${i}`, text }));

  return (
    <DynamicListEditor
      items={wrappedItems}
      onChange={(newItems) => onChange(newItems.map((item) => item.text))}
      title={title}
      addButtonText={addButtonText}
      emptyMessage="No items added yet"
      createNewItem={() => ({
        id: `item-${Date.now()}`,
        text: "",
      })}
      renderItem={(item, _index, updateItem) => (
        <Input
          value={item.text}
          onChange={(e) => updateItem({ text: e.target.value })}
          placeholder={placeholder}
        />
      )}
    />
  );
}

interface TextItemListEditorProps {
  items: { id: string; text: string }[];
  onChange: (items: { id: string; text: string }[]) => void;
  title?: string;
  placeholder?: string;
  addButtonText?: string;
}

export function TextItemListEditor({
  items,
  onChange,
  title = "Items",
  placeholder = "Enter item...",
  addButtonText = "Add Item",
}: TextItemListEditorProps) {
  return (
    <DynamicListEditor
      items={items}
      onChange={onChange}
      title={title}
      addButtonText={addButtonText}
      emptyMessage="No items added yet"
      createNewItem={() => ({
        id: `item-${Date.now()}`,
        text: "",
      })}
      renderItem={(item, _index, updateItem) => (
        <Input
          value={item.text}
          onChange={(e) => updateItem({ text: e.target.value })}
          placeholder={placeholder}
        />
      )}
    />
  );
}
