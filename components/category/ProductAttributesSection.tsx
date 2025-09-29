"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Checkbox } from "../ui/checkbox";
import { OutlineInput } from "../ui/OutlineInputs";
import FetchSelect from "../FetchSelect";

interface Colors {
  id: number;
  name: string;
}

interface Countries {
  id: number;
  name: string;
}

interface ProductAttribute {
  type: "string" | "number" | "boolean";
  required?: boolean;
  default?: string | number | boolean;
  enum?: (string | number)[];
}

interface ProductAttributesMap {
  [key: string]: ProductAttribute;
}

interface ProductAttributesSectionProps {
  value: ProductAttributesMap;
  onChange: (value: ProductAttributesMap) => void;
  token: string;
  lang: string;
  t: (key: string) => string;
  fetchColors: (params: any) => Promise<any>;
  fetchCountries: (params: any) => Promise<any>;
}

const ProductAttributesSection = ({
  value,
  onChange,
  token,
  lang,
  t,
  fetchColors,
  fetchCountries,
}: ProductAttributesSectionProps) => {
  const attributes = value || {};
  const [attributeKeys, setAttributeKeys] = useState(Object.keys(attributes));
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(
    new Set()
  );

  // Initialize the selected values from existing attributes
  useEffect(() => {
    if (attributes?.["color"]?.enum) {
      setSelectedColors(
        new Set(
          (attributes["color"].enum || []).map((v: string | number) =>
            String(v)
          )
        )
      );
    }

    if (attributes?.["country"]?.enum) {
      setSelectedCountries(
        new Set(
          (attributes["country"].enum || []).map((v: string | number) =>
            String(v)
          )
        )
      );
    }
  }, [attributes]);

  // Add a new attribute with special handling for color and country
  const addAttribute = () => {
    if (!newAttributeKey.trim()) return;
    if (attributeKeys.includes(newAttributeKey)) {
      toast.error(t("attribute_already_exists"));
      return;
    }

    const newAttributes: ProductAttributesMap = {
      ...attributes,
      [newAttributeKey]: { type: "string", required: false },
    };

    onChange(newAttributes);
    setAttributeKeys([...attributeKeys, newAttributeKey]);
    if (newAttributeKey.toLowerCase() === "color") {
      setSelectedColors(new Set());
    } else if (newAttributeKey.toLowerCase() === "country") {
      setSelectedCountries(new Set());
    }
    setNewAttributeKey("");
  };

  // Remove an attribute
  const removeAttribute = (key: string) => {
    const { [key]: _, ...rest } = attributes;
    onChange(rest);
    setAttributeKeys(attributeKeys.filter((k) => k !== key));
    if (key.toLowerCase() === "color") {
      setSelectedColors(new Set());
    } else if (key.toLowerCase() === "country") {
      setSelectedCountries(new Set());
    }
  };

  // Update an attribute property
  const updateAttribute = (key: string, property: string, value: any) => {
    const updatedAttr = {
      ...attributes[key],
      [property]: value,
    };

    onChange({
      ...attributes,
      [key]: updatedAttr,
    });
  };

  // Add enum value
  const addEnumValue = (key: string, value: string) => {
    if (!value.trim()) return;

    const currentEnum: string[] = (attributes[key].enum as string[]) || [];
    if (currentEnum.includes(value)) {
      toast.error(t("enum_value_already_exists"));
      return;
    }

    updateAttribute(key, "enum", [...currentEnum, value]);
  };

  // Add multiple enum values (for colors/countries)
  const addMultipleEnumValues = (
    key: string,
    values: { id: number; name: string }[]
  ) => {
    const names = values.map((item) => item.name);
    if (!names.length) return;

    const currentEnum: string[] = (attributes[key].enum as string[]) || [];
    const newValues = names.filter((name) => !currentEnum.includes(name));

    if (newValues.length) {
      if (key.toLowerCase() === "color") {
        const updatedSet = new Set(Array.from(selectedColors));
        names.forEach((name) => updatedSet.add(name));
        setSelectedColors(updatedSet);
      } else if (key.toLowerCase() === "country") {
        const updatedSet = new Set(Array.from(selectedCountries));
        names.forEach((name) => updatedSet.add(name));
        setSelectedCountries(updatedSet);
      }
      updateAttribute(key, "enum", [...currentEnum, ...newValues]);
    }
  };

  // Remove enum value
  const removeEnumValue = (key: string, value: string) => {
    const currentEnum = attributes[key].enum || [];

    if (key.toLowerCase() === "color") {
      const updatedSet = new Set(Array.from(selectedColors));
      updatedSet.delete(value);
      setSelectedColors(updatedSet);
    } else if (key.toLowerCase() === "country") {
      const updatedSet = new Set(Array.from(selectedCountries));
      updatedSet.delete(value);
      setSelectedCountries(updatedSet);
    }
    updateAttribute(
      key,
      "enum",
      currentEnum.filter((v) => v !== value)
    );
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <OutlineInput
          id="new-attribute-name"
          label={t("attribute_name")}
          value={newAttributeKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewAttributeKey(e.target.value)
          }
          className="flex-1"
        />
        <button
          type="button"
          onClick={addAttribute}
          className="self-end h-10 px-4 text-xxs bg-primary text-white rounded-md hover:bg-primary/80"
        >
          {t("add attribute")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {attributeKeys.map((key) => (
          <div key={key} className="border p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-lg">{key}</h4>
              <button
                type="button"
                onClick={() => removeAttribute(key)}
                className="text-red-500 hover:text-red-700"
              >
                {t("remove")}
              </button>
            </div>

            <div className="space-y-3">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("type")}
                </label>
                <select
                  value={attributes[key].type}
                  onChange={(e) => updateAttribute(key, "type", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                </select>
              </div>

              {/* Required checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`required-${key}`}
                  checked={!!attributes[key].required}
                  onCheckedChange={(checked) =>
                    updateAttribute(key, "required", !!checked)
                  }
                />
                <label htmlFor={`required-${key}`} className="text-sm">
                  {t("required")}
                </label>
              </div>

              {/* Default value */}
              <div>
                {attributes[key].type === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`default-${key}`}
                      checked={!!attributes[key].default}
                      onCheckedChange={(checked) =>
                        updateAttribute(key, "default", !!checked)
                      }
                    />
                    <label htmlFor={`default-${key}`} className="text-sm">
                      {t("true")}
                    </label>
                  </div>
                ) : (
                  <OutlineInput
                    id={`default-input-${key}`}
                    label={t("default_value")}
                    value={
                      typeof attributes[key].default === "boolean"
                        ? attributes[key].default
                          ? "true"
                          : "false"
                        : attributes[key].default || ""
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAttribute(
                        key,
                        "default",
                        attributes[key].type === "number"
                          ? parseFloat(e.target.value) || 0
                          : e.target.value
                      )
                    }
                  />
                )}
              </div>

              {/* Enum values (for string and number types) */}
              {attributes[key].type !== "boolean" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("allowed_values")}
                  </label>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {(attributes[key].enum || []).map((value, i) => (
                      <div
                        key={i}
                        className="flex items-center bg-gray-100 px-2 py-1 rounded-md"
                      >
                        <span>{value}</span>
                        <button
                          type="button"
                          onClick={() => removeEnumValue(key, String(value))}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Special handling for color/country */}
                  {key.toLowerCase() === "color" ? (
                    <div className="mb-3">
                      <FetchSelect<Colors>
                        label={
                          t("Select colors to add")
                        }
                        fetchFunction={(params) =>
                          fetchColors({
                            ...params,
                            token,
                            lang,
                            notIn: selectedColors
                              ? Array.from(selectedColors)
                              : undefined,
                          })
                        }
                        getOptionValue={(item) => item.id}
                        getOptionDisplayText={(item) => item.name}
                        getOptionLabel={(item) => item.name}
                        className="w-full"
                        multiple
                        onChange={(selectedColors) => {
                          addMultipleEnumValues(key, selectedColors);
                        }}
                      />
                    </div>
                  ) : key.toLowerCase() === "country" ? (
                    <div className="mb-3">
                      <FetchSelect<Countries>
                        label={
                          t("Select countries to add")
                        }
                        fetchFunction={(params) =>
                          fetchCountries({
                            ...params,
                            token,
                            lang,
                            notIn: selectedCountries
                              ? Array.from(selectedCountries)
                              : undefined,
                          })
                        }
                        getOptionValue={(item) => item.id}
                        getOptionDisplayText={(item) => item.name}
                        getOptionLabel={(item) => item.name}
                        className="w-full"
                        multiple
                        onChange={(selectedCountries) => {
                          addMultipleEnumValues(key, selectedCountries);
                        }}
                      />
                    </div>
                  ) : (
                    // Regular input for other attribute types
                    <div className="flex gap-2 justify-center items-center">
                      <OutlineInput
                        label={t("add_value")}
                        className="flex-1"
                        id={`enum-input-${key}`}
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addEnumValue(key, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            `enum-input-${key}`
                          ) as HTMLInputElement;
                          addEnumValue(key, input.value);
                          input.value = "";
                        }}
                        className="h-10 px-3 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {attributeKeys.length === 0 && (
        <p className="text-gray-500 italic">
          {t("no_attributes")}
        </p>
      )}
    </>
  );
};

export default ProductAttributesSection;
