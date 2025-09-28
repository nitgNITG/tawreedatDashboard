import axios from 'axios';
import React, { memo, useEffect, useState } from 'react';
import { LoadingIcon } from '../icons';
import { useLocale } from 'next-intl';
import clsx from 'clsx';
import mlang from '@/lib/mLang';

const SelectParent = memo(({
    setValue,
    categoryId,
    isEditable,
    parent
}: {
    setValue: any,
    categoryId?: any,
    isEditable: boolean,
    parent?: any
}) => {
    const locale = useLocale()
    const [cate, setCate] = useState([]);
    const [keyword, setKeyword] = useState(mlang(parent?.name, locale as 'ar' | 'en') ?? 'Top');
    const [open, setOpen] = useState(false);
    const [typing, setTyping] = useState(null as any);
    const [loading, setloading] = useState(false);

    const handleSearch = async () => {
        if (keyword) {
            setloading(false)
            const { data } = await axios.get(`/api/category?fields=name,id&keyword=${keyword}&items=name&limit=2&lang=${locale}`)
            setCate(c => [{ name: 'Top', id: null }, ...data.categories] as any)
        }
    }
    useEffect(() => {
        if (typing) {
            setloading(true)
            const timer = setTimeout(() => { setTyping(false) }, 1000)
            return () => clearTimeout(timer)
        }
    }, [typing])

    useEffect(() => {
        if (!typing && typing != null) {
            handleSearch()
            setloading(false)
        }
    }, [typing])

    return (
        <div>
            <div>
                <div className='relative flex items-center h-fit w-full md:w-fit'>
                    <input
                        type="text"
                        className='w-full md:w-fit border-2 border-primary disabled:border-primary/50 px-2 py-1 rounded-md'
                        onChange={(e) => {
                            setKeyword(e.target.value)
                            setTyping(true)
                            setOpen(e.target.value ? true : false)
                        }}
                        disabled={!isEditable}
                        value={keyword}
                    />
                    <div className={clsx(
                        'absolute',
                        { "pr-3 right-0": locale != 'ar' },
                        { "left-3": locale == 'ar' },
                    )}>
                        {loading && <LoadingIcon className='peer-focus:fill-primary animate-spin' />}
                    </div>
                </div>
                {open &&
                    <div onClick={() => { }} className='absolute bg-white top-9 shadow-md rounded-lg w-full overflow-hidden'>
                        {cate.map((item: any, index) => (
                            categoryId != item.id &&
                            <div
                                key={item.id}
                                className='flex items-center justify-between py-2 border-b px-2 cursor-pointer hover:bg-gray-300 duration-300'
                                onClick={() => {
                                    setOpen(false)
                                    setKeyword(item.name)
                                    setValue("parentId", item.id == null ? 'null' : item.id)
                                }}
                            >
                                {item.name}
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}
);

SelectParent.displayName = 'selectparent';
export default SelectParent;
