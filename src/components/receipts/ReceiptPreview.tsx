"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { GeminiReceiptData, GeminiReceiptItem, CurrencyCode } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Edit2,
  Trash,
  AlertCircle,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { formatCurrency } from "@/types";

interface ReceiptPreviewProps {
  data: GeminiReceiptData;
  originalImage: string | null;
  onConfirm: (data: GeminiReceiptData) => void;
  onCancel: () => void;
  confidence?: number | null;
}

export default function ReceiptPreview({
  data,
  originalImage,
  onConfirm,
  onCancel,
  confidence = null,
}: ReceiptPreviewProps) {
  const { t } = useTranslation();
  const [editedData, setEditedData] = useState<GeminiReceiptData>(data);
  const [editMode, setEditMode] = useState(false);

  // Handle edit of receipt header information
  const handleHeaderChange = (
    field: keyof GeminiReceiptData,
    value: string | number | null
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle edit of receipt items
  const handleItemChange = (
    index: number,
    field: keyof GeminiReceiptItem,
    value: string | number | null
  ) => {
    const newItems = [...editedData.items];

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // If quantity or price changes, update the total price
    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        field === "quantity" ? Number(value) : newItems[index].quantity;
      const unitPrice =
        field === "unitPrice" ? Number(value) : newItems[index].unitPrice;

      newItems[index].totalPrice = quantity * unitPrice;
    }

    setEditedData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Delete an item from the list
  const handleDeleteItem = (index: number) => {
    const newItems = editedData.items.filter((_, i) => i !== index);

    setEditedData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Add a new blank item
  const handleAddItem = () => {
    const newItem: GeminiReceiptItem = {
      name: "",
      description: null,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      category: null,
      confidenceScore: 1.0,
    };

    setEditedData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Move item up or down in the list
  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === editedData.items.length - 1)
    ) {
      return;
    }

    const newItems = [...editedData.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];

    setEditedData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return editedData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const subtotal = calculateSubtotal();

  // Update totals when data changes
  useEffect(() => {
    const newSubtotal = calculateSubtotal();
    const tax = editedData.tax || 0;
    const tip = editedData.tip || 0;
    const newTotal = newSubtotal + tax + tip;

    setEditedData((prev) => ({
      ...prev,
      subtotal: newSubtotal,
      total: newTotal,
    }));
  }, [editedData.items, editedData.tax, editedData.tip]);

  // Confidence indicator color
  const getConfidenceColor = () => {
    if (!confidence) return "text-gray-500";
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.5) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("receipts.confirmReceipt")}</CardTitle>
        <div className="flex items-center space-x-2">
          {confidence !== null && (
            <span className={`text-sm font-medium ${getConfidenceColor()}`}>
              {t("receipts.confidence", {
                value: Math.round(confidence * 100),
              })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Edit2 className="h-4 w-4 mr-1" />
            )}
            {editMode ? t("common.done") : t("common.edit")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {t("receipts.storeName")}
                </label>
                {editMode ? (
                  <Input
                    value={editedData.storeName}
                    onChange={(e) =>
                      handleHeaderChange("storeName", e.target.value)
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-semibold">
                    {editedData.storeName}
                  </p>
                )}
                {editedData.storeAddress && (
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editedData.storeAddress || ""}
                        onChange={(e) =>
                          handleHeaderChange("storeAddress", e.target.value)
                        }
                        placeholder={t("receipts.storeAddress")}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">
                        {editedData.storeAddress}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">
                    {t("receipts.date")}
                  </label>
                  {editMode ? (
                    <Input
                      type="date"
                      value={editedData.date || ""}
                      onChange={(e) =>
                        handleHeaderChange("date", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p>{editedData.date}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("receipts.time")}
                  </label>
                  {editMode ? (
                    <Input
                      type="time"
                      value={editedData.time || ""}
                      onChange={(e) =>
                        handleHeaderChange("time", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p>{editedData.time}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {originalImage && (
            <div className="relative aspect-auto h-48 overflow-hidden rounded-md border">
              <Image
                src={originalImage}
                alt={t("receipts.viewOriginal")}
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{t("receipts.itemList")}</h3>
            {editMode && (
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                {t("receipts.addItem")}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {editedData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded"
              >
                {editMode && (
                  <div className="col-span-1 flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveItem(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveItem(index, "down")}
                      disabled={index === editedData.items.length - 1}
                    >
                      <ChevronsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className={editMode ? "col-span-5" : "col-span-6"}>
                  {editMode ? (
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="text-sm"
                      placeholder={t("notes.itemName")}
                    />
                  ) : (
                    <p className="text-sm font-medium">{item.name}</p>
                  )}
                </div>

                <div className="col-span-2">
                  {editMode ? (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm text-center">{item.quantity}</p>
                  )}
                </div>

                <div className="col-span-2">
                  {editMode ? (
                    <Input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitPrice",
                          Number(e.target.value)
                        )
                      }
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm text-right">
                      {formatCurrency(
                        item.unitPrice,
                        (editedData.currency as CurrencyCode) || "VND"
                      )}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-right font-medium">
                    {formatCurrency(
                      item.totalPrice,
                      (editedData.currency as CurrencyCode) || "VND"
                    )}
                  </p>
                </div>

                {editMode && (
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteItem(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {!editMode && item.confidenceScore < 0.7 && (
                  <div className="col-span-1">
                    <div className="flex items-center justify-center">
                      <AlertCircle
                        className="h-4 w-4 text-amber-500"
                        aria-label={t("receipts.lowConfidence")}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t("notes.subtotal")}</span>
            <span>
              {formatCurrency(
                subtotal,
                (editedData.currency as CurrencyCode) || "VND"
              )}
            </span>
          </div>

          <div className="flex justify-between">
            <span>{t("notes.tax")}</span>
            {editMode ? (
              <Input
                type="number"
                min="0"
                value={editedData.tax || 0}
                onChange={(e) =>
                  handleHeaderChange("tax", Number(e.target.value))
                }
                className="w-32 text-right"
              />
            ) : (
              <span>
                {formatCurrency(
                  editedData.tax || 0,
                  (editedData.currency as CurrencyCode) || "VND"
                )}
              </span>
            )}
          </div>

          {(editedData.tip !== null || editMode) && (
            <div className="flex justify-between">
              <span>{t("notes.tip")}</span>
              {editMode ? (
                <Input
                  type="number"
                  min="0"
                  value={editedData.tip || 0}
                  onChange={(e) =>
                    handleHeaderChange("tip", Number(e.target.value))
                  }
                  className="w-32 text-right"
                />
              ) : (
                <span>
                  {formatCurrency(
                    editedData.tip || 0,
                    (editedData.currency as CurrencyCode) || "VND"
                  )}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between font-bold">
            <span>{t("notes.total")}</span>
            <span>
              {formatCurrency(
                editedData.total,
                (editedData.currency as CurrencyCode) || "VND"
              )}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => onConfirm(editedData)}>
          {t("receipts.confirmAndCreate")}
        </Button>
      </CardFooter>
    </Card>
  );
}
