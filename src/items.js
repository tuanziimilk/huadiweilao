// Gameplay progression follows size/readability rather than the chronology of the memes.
export const ITEMS=[
 ['07-duck-tongue','鸭舌',36],
 ['01-microphone','超女麦克风',44],
 ['03-soap','洗衣皂',54],
 ['06-hourglass','15年沙漏',65],
 ['02-youth-photo','青春合照',78],
 ['04-heart-shirt','心形衣服',103],
 ['09-eating','先吃饭',118],
 ['08-embrace','娜娜是你的',134],
 ['10-cliff-house','悬崖小屋',151],
 ['11-caged-xufei','画地为牢',170],
].map(([key,name,size])=>({key,name,size,path:`${import.meta.env.BASE_URL}assets/items/${key}.png`}));
