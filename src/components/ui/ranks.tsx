"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle } from "./card";
import Image from "next/image";

type RankData = {
  name: string;
  image: string;
  points: number;
};

const data = [
  {
    name: 'Hilal Dallashi',
    image: '/me.png', 
    point: 800
  },
  {
    name: 'AbduRahman Darwish',
    image: '/aaaa.jpg',
    point: 999
  },
  {
    name: 'Anas Al Sakar',
    image: '/anas.jpg',
    point: 999
  },
  {
    name: 'Bara Amro',
    image: '/baraa.jpg',
    point: 400
  },
  {
    name: 'Abdullah Jama',
    image: '/abdullah.jpg',
    point: 0
  },
];

const RankCard = () => {
  const [rankData, setRankData] = useState<RankData[]>([]);

  useEffect(() => {
    fetch("/api/rankData")
      .then((response) => response.json())
      .then((data) => setRankData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const rankColors = ["#4CAF50", "#C0C0C0", "#CD7F32"];
  const defaultRankColor = "#003566";
  const rankCoverColors = ["#283618", "#a3b18a", "#dda15e"];
  const defRankCoverColor = "#000814";

  return (
    <div className="space-y-4">
      {data.sort((a, b) => b.point - a.point).map((rank, index) => {
        const rankColor = rankColors[index] || defaultRankColor;

        return (
          <Card
            key={index}
            className="w-full sm:w-[1500px] h-[220px]"
            style={{ backgroundColor: rankColor }}
          >
            <div className="flex w-full h-full items-center">
              <div className="w-1/4 h-full flex justify-center items-center ml-4">
                <Card
                  style={{ backgroundColor: `${rankCoverColors[index] || defRankCoverColor}` }}
                  className="w-[150px] h-[150px] border-none"
                >
                  <Image
                    src={rank.image}
                    alt="Competitor"
                    className="w-full h-full object-cover"
                    width={150}
                    height={150}
                  />
                </Card>
              </div>

              <div className="flex-1 h-full flex items-center justify-center relative">
                <CardTitle className="text-left text-white text-4xl font-semibold truncate max-w-[50%]">
                  {rank.name}
                </CardTitle>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-[8px] h-24 bg-white"></div>

                <CardTitle className="text-center text-white text-4xl font-semibold ml-auto" style={{ width: "120px" }}>
                  # {String(index + 1).padStart(3, "0")}
                </CardTitle>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RankCard;
