interface InfoPriceProps {
    distanceKm: number | null;
    loading: boolean;
    price: number | null
}
export default function InfoPrice({ distanceKm, loading, price}: InfoPriceProps) {

    return <div className="
  absolute bottom-6 left-1/2 -translate-x-1/2
  w-[22rem]
  rounded-2xl
  border border-gray-200/60
  bg-white/90 backdrop-blur-xl
  shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]
  p-5
">
  {loading ? (
    <div className="flex items-center gap-3">
      <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
      <p className="text-sm text-gray-600">
        Calculando ruta...
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Resumen de ruta
        </h3>
        <div className="h-2 w-2 rounded-full bg-green-500" />
      </div>

      {/* Distance */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm">
          Distancia
        </span>
        <span className="text-gray-900 font-semibold">
          {distanceKm} km
        </span>
      </div>

      <div className="h-px bg-gray-200/60" />

      {/* Price */}
      <div className="flex items-end justify-between">
        <span className="text-gray-600 text-sm">
          Precio sugerido
        </span>
        <span className="text-2xl font-bold text-gray-900">
          ${price}
        </span>
      </div>

    </div>
  )}
</div>

}