import React from "react";
import { Card, CardFooter, CardContent } from "../ui/card";
import ImageApi from "../ImageApi";

interface CardGridItemProps {
  image: {
    url?: string;
    alt: string;
  };
  cardContent?: React.ReactNode;
  cardFooter: React.ReactNode;
  isPriority?: boolean; // Optional prop to indicate priority
}

const CardGridItem = ({
  image,
  cardFooter,
  cardContent,
  isPriority = false,
}: CardGridItemProps) => {
  return (
    <Card className="min-h-[220px] max-w-[350px] flex flex-col items-center shadow-md bg-white rounded-2xl transition hover:shadow-lg">
      <div className="relative flex justify-center items-center h-[140px] w-full">
        <ImageApi
          key={image.url}
          src={image.url ?? "/imgs/notfound.png"}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          quality={100}
          className="object-cover rounded-t-lg"
          priority={isPriority}
        />
      </div>
      {cardContent && (
        <CardContent className="flex justify-between items-center w-full px-2 py-2 gap-2">
          {cardContent}
        </CardContent>
      )}
      <CardFooter className="flex justify-between items-center w-full px-2 pb-2">
        {cardFooter}
      </CardFooter>
    </Card>
  );
};

export default CardGridItem;
