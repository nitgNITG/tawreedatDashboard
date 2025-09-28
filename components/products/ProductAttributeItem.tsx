import { useState, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { OutlineInput } from "../ui/OutlineInputs";
import { Checkbox } from "../ui/checkbox";
import { useTranslations } from "next-intl";
import { ProductForm } from "./AddProduct";

interface AttributeConfig {
  type: "string" | "number" | "boolean";
  required?: boolean;
  default?: string | number | boolean;
  enum?: string[] | number[];
}

interface ProductAttributeItemProps {
  attributeKey: string;
  attributeConfig: AttributeConfig;
  index: number;
  form: Pick<UseFormReturn<ProductForm>, "register" | "setValue" | "control">;
  productValue?: string;
  errors: Record<string, any>;
  registerPath: `attributes.${number}.value`; // More specific type
  keyPath: `attributes.${number}.key`; // More specific type
}

const ProductAttributeItem = ({
  attributeKey,
  attributeConfig,
  index,
  form,
  productValue,
  registerPath,
  keyPath,
  errors,
}: ProductAttributeItemProps) => {
  const { register, setValue, control } = form;
  const t = useTranslations("products");
  const [selectedValue, setSelectedValue] = useState<string | number | boolean>(
    productValue || attributeConfig.default || ""
  );

  // Always set the key immediately on mount
  useEffect(() => {
    // Always set the key first - this is crucial!
    setValue(keyPath, attributeKey);

    // Then handle the value
    if (!productValue && attributeConfig.default !== undefined) {
      setValue(registerPath, String(attributeConfig.default));
    } else if (productValue !== undefined) {
      setValue(registerPath, productValue);
    }
  }, [attributeKey, keyPath, setValue, index]);

  // Set up hidden input for the key
  // This ensures the key is always submitted with the form
  const hiddenKeyInput = (
    <input type="hidden" {...register(keyPath)} defaultValue={attributeKey} />
  );

  // Error message extraction
  const errorMessage =
    Array.isArray(errors.attributes) && errors.attributes[index]?.value?.message
      ? (errors.attributes[index].value.message as string)
      : undefined;

  // Render based on attribute type
  const renderAttributeInput = () => {
    switch (attributeConfig.type) {
      case "boolean":
        return (
          <>
            {hiddenKeyInput}
            <Controller
              control={control}
              name={registerPath}
              // defaultValue={
              //   productValue === "true" || attributeConfig.default === true
              // }
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`attribute-${attributeKey}`}
                    // checked={field.value === "true" || field.value === true}
                    defaultChecked={
                      productValue === "true" ||
                      attributeConfig.default === true
                    }
                    onCheckedChange={(checked) => {
                      field.onChange(checked ? "true" : "false");
                      setSelectedValue(checked);
                    }}
                  />
                  <label
                    htmlFor={`attribute-${attributeKey}`}
                    className="text-sm cursor-pointer"
                  >
                    {attributeKey}
                  </label>
                </div>
              )}
            />
          </>
        );

      case "number":
        if (attributeConfig.enum && attributeConfig.enum.length > 0) {
          return (
            <div>
              {hiddenKeyInput}
              <label className="block text-sm font-medium mb-1">
                {attributeKey}
              </label>
              <select
                {...register(registerPath, {
                  required: attributeConfig.required
                    ? "attribute Is Required"
                    : false,
                })}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setSelectedValue(e.target.value)}
                value={selectedValue as string}
              >
                <option value="">select</option>
                {attributeConfig.enum.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errorMessage && (
                <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
              )}
            </div>
          );
        } else {
          return (
            <>
              {hiddenKeyInput}
              <OutlineInput
                label={attributeKey}
                id={`attribute-${attributeKey}`}
                type="number"
                error={errorMessage}
                {...register(registerPath, {
                  required: attributeConfig.required
                    ? "attribute Is Required"
                    : false,
                  // valueAsNumber: true,
                })}
              />
            </>
          );
        }

      case "string":
      default:
        if (attributeConfig.enum && attributeConfig.enum.length > 0) {
          return (
            <div>
              {hiddenKeyInput}
              <label className="block text-sm font-medium mb-1">
                {attributeKey}
              </label>
              <select
                {...register(registerPath, {
                  required: attributeConfig.required
                    ? "attribute Is Required"
                    : false,
                })}
                className="w-full p-2 border rounded-md"
                onChange={(e) => setSelectedValue(e.target.value)}
                value={selectedValue as string}
              >
                <option value="">select</option>
                {attributeConfig.enum.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errorMessage && (
                <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
              )}
            </div>
          );
        } else {
          return (
            <>
              {hiddenKeyInput}
              <OutlineInput
                label={attributeKey}
                id={`attribute-${attributeKey}`}
                error={errorMessage}
                {...register(registerPath, {
                  required: attributeConfig.required
                    ? "attribute Is Required"
                    : false,
                })}
              />
            </>
          );
        }
    }
  };

  return <div className="mb-4">{renderAttributeInput()}</div>;
};

export default ProductAttributeItem;
