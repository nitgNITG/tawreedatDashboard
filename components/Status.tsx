'use client'
import { useAppContext } from '@/context/appContext';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { LoadingIcon } from './icons';
type StatusKeys = 'ACCEPTED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';

type StatusColor = {
    [key in StatusKeys]: { color: string };
};
const Status = (props: { status: any, orderId: string }) => {
    const [status, setStatus] = useState(props.status)
    const [valueStatus, setValueStatus] = useState(props.status)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false);

    const { token } = useAppContext()

    const statusColor: StatusColor = {
        PENDING: { color: "#ffb400" },
        ACCEPTED: { color: '#16b1ff', },
        COMPLETED: { color: "#56ca00" },
        CANCELLED: { color: "#dc2626" },
    }
    const handleChangeStatus = async (e: any) => {
        try {
            e.preventDefault()
            setLoading(true);
            await axios.put(`/api/order-chage-status/${props.orderId}`, {
                status: valueStatus
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            setStatus(valueStatus);
            setOpen(false);
        } catch (error: any) {
            setLoading(false)
            console.error(error);
            toast.error(error?.response?.data?.message || 'There is an Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="relative inline-flex select-none">
                <button onClick={() => setOpen(!open)} type="button" className="w-[10rem] py-3 px-4 inline-flex justify-between items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                    <div
                        className='w-fit px-2 flex justify-center text-xs py-1 rounded-full text-white'
                        style={{
                            backgroundColor: statusColor[status as StatusKeys]?.color,
                        }}>
                        {status}
                    </div>
                    <ChevronDown className={cn('size-4', {
                        'rotate-180': open,
                    })} />
                </button>

                <div className={cn("absolute z-50 top-10 hidden opacity-0 transition-[opacity,margin] min-w-60 bg-white shadow-md rounded-lg mt-2 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full",
                    { 'block opacity-100': open }
                )} role="menu" aria-orientation="vertical" >
                    <form onSubmit={handleChangeStatus} className="p-1 space-y-0.5">
                        {
                            Object
                                .entries(statusColor)
                                .map(([key, value]) => {
                                    return (
                                        <div
                                            onClick={() => {
                                                setValueStatus(key)
                                            }}
                                            key={key}
                                            className="cursor-pointer w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 bg-white"
                                            style={{
                                                backgroundColor: valueStatus == key ? '#f3f4f6' : "",
                                            }}
                                        >
                                            <div className='flex gap-1 items-center'>
                                                <div
                                                    className='size-3 border rounded-full' style={{
                                                        backgroundColor: value.color
                                                    }} />
                                                <div>
                                                    {key}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                        }
                        <div className='px-2 py-2'>
                            <button className='w-full bg-primary text-white py-2 rounded-md flex justify-center'>
                                {loading ? <LoadingIcon className='animate-spin size-5' /> : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Status