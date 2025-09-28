"use client";
import { Contact as IContact, ContactState } from "@/types/contact";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setContacts } from "@/redux/reducers/contactsReducer";
import Table, { TableHeader } from "../ui/Table";
import DownloadButton from "../ui/DownloadButton";
import Pagination from "../ui/Pagination";
import { DateToText } from "@/lib/DateToText";
import DeleteContactPopup from "./DeleteContactPopup";
import UpdateContactPopup from "./UpdateContactPopup";
import SendNotificationDialog from "./SendNotificationDialog";
import { DeleteIcon, EditIcon } from "../icons";
import clsx from "clsx";
import { MessageCirclePlus } from "lucide-react";

const Contact = ({ contacts, totalPages, totalCount }: ContactState) => {
  const t = useTranslations("contact");
  const locale = useLocale() as "en" | "ar";
  const dispatch = useAppDispatch();
  const [deleteContact, setDeleteContact] = useState<IContact | null>(null);
  const [updateContact, setUpdateContact] = useState<IContact | null>(null);
  const [sendNotification, setSendNotification] = useState<boolean>(false);

  const totalCountRedux = useAppSelector((state) => state.contacts.totalCount);
  const totalPagesRedux = useAppSelector((state) => state.contacts.totalPages);
  const contactsRedux = useAppSelector((state) => state.contacts.contacts);

  useEffect(() => {
    dispatch(setContacts({ contacts, totalPages, totalCount }));
  }, [contacts, totalPages, totalCount, dispatch]);

  const headers: TableHeader[] = [
    { name: "date", className: "px-6 py-4" },
    {
      name: "name",
      className: "px-6 py-4",
      sortable: true,
      key: "name",
    },
    { name: "email", className: "px-6 py-4" },
    { name: "message", className: "px-6 py-4" },
    { name: "action", className: "px-6 py-4 flex justify-center" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h4 className="font-bold text-lg md:text-xl lg:text-2xl">
            {t("contacts")}
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setSendNotification(true)}
          className="px-5 py-2 flex gap-3 justify-center items-center bg-primary rounded-md text-white font-medium"
        >
          <MessageCirclePlus className="size-5" />
          {t("sendNotification")}
        </button>
      </div>
      <Table
        headers={headers}
        pagination={
          <Pagination
            count={totalCountRedux}
            totalPages={totalPagesRedux}
            downloadButton={
              <DownloadButton<IContact>
                model="contactUs"
                fields={["id", "name", "email", "createdAt", "message"]}
              />
            }
          />
        }
      >
        {!contactsRedux.length && (
          <tr className="odd:bg-white even:bg-primary/5 border-b">
            <td
              colSpan={headers.length}
              scope="row"
              className="px-6 py-4 text-center font-bold"
            >
              {t("no data yet")}
            </td>
          </tr>
        )}
        {contactsRedux?.map((contact) => (
          <tr
            key={contact.id}
            className={clsx(
              "border-b",
              contact.readed ? "bg-[#e8f5f5]" : "bg-white "
            )}
          >
            <td className="px-6 py-4">{DateToText(contact.createdAt ?? "", locale)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
            <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis font-bold">
              {contact.message}
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2 justify-center items-center">
                {!contact.readed && (
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateContact(contact);
                    }}
                    className="text-primary hover:text-gray-700 transition-colors"
                  >
                    <EditIcon className="size-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDeleteContact(contact);
                  }}
                  className="text-primary hover:text-gray-700 transition-colors"
                >
                  <DeleteIcon className="size-5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      {deleteContact && (
        <DeleteContactPopup
          contact={deleteContact}
          setContact={setDeleteContact}
          openForm={!!deleteContact}
          setOpenForm={(open: boolean) => !open && setDeleteContact(null)}
        />
      )}{" "}
      <UpdateContactPopup
        contact={updateContact}
        setContact={setUpdateContact}
        openForm={!!updateContact}
        setOpenForm={(open: boolean) => !open && setUpdateContact(null)}
      />
      {sendNotification && (
        <SendNotificationDialog
          open={sendNotification}
          setOpen={(open: boolean) => !open && setSendNotification(false)}
        />
      )}
    </div>
  );
};

export default Contact;
