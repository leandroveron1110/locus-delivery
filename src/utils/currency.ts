export function formatARS(
 value:number|null
){

if(value===null)
 return '-';


return new Intl.NumberFormat(
'es-AR',
{
style:'currency',
currency:'ARS'
}
)
.format(value);


}