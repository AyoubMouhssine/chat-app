interface AvatarProps  {
    width:string;
    height:string;
    src:string | undefined;
    alt:string;
}

export default function Avatar({width, height, src, alt} :AvatarProps ) {
    return <img src={src} width={width} height={height} alt={alt}/>
} 