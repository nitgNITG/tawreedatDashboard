"use client";
import React, { useState } from "react";
import { InputField } from "./InputFields";
import { StatusDropdown } from "./Status dropdown";
import { ImageUpload } from "./ImageUpload";
import { DatePicker } from "./DatePicker";
import { Button } from "./Buttonn";

export const InputDesign: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    phone: "",
    status: "Not Active",
    location: "",
    validFrom: "20/08/2025",
    validTo: "20/11/2025",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-none max-w-[966px]">
      <section className="px-9 pt-16 pb-6 w-full bg-white rounded-3xl shadow-sm max-md:px-5 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <section className="w-[35%] max-md:ml-0 max-md:w-full">
            <div className="w-full max-md:mt-10 space-y-2">
              <InputField
                label="Name :"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
              />
              <InputField
                label="URL :"
                value={formData.url}
                onChange={(value) => setFormData({ ...formData, url: value })}
              />
              <InputField
                label="Phone:"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                type="tel"
              />
              <StatusDropdown
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              />
              <InputField
                label="Location :"
                value={formData.location}
                onChange={(value) =>
                  setFormData({ ...formData, location: value })
                }
              />
            </div>
          </section>

          <section className="ml-5 w-[65%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col items-start w-full text-xs max-md:mt-10 max-md:max-w-full">
              <div className="flex gap-5 text-black">
                <ImageUpload
                  label="Brand Logo"
                  onChange={(file) => console.log("Logo uploaded:", file)}
                />
                <ImageUpload
                  label="Brand Cover"
                  onChange={(file) => console.log("Cover uploaded:", file)}
                />
              </div>

              <div className="flex gap-2.5 mt-5">
                <DatePicker
                  label="Valid From :"
                  value={formData.validFrom}
                  onChange={(value) =>
                    setFormData({ ...formData, validFrom: value })
                  }
                />
                <DatePicker
                  label="Valid To :"
                  value={formData.validTo}
                  onChange={(value) =>
                    setFormData({ ...formData, validTo: value })
                  }
                />
              </div>

              <div className="flex gap-5 justify-between items-start self-end mt-24 max-w-full w-[332px] max-md:mt-10">
                <Button type="submit">Add Brand</Button>
                <Button
                  variant="secondary"
                  onClick={() => console.log("Cancel clicked")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </form>
  );
};

export default InputDesign;
