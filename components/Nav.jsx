import { motion } from 'motion/react'

export default function Navigation({  
    ingredientsConf, 
    potDataConf, 
    historyConf, 
    playerInfoConf, 
    settingConf,
    isMobile
}){

    const navMenu = [
        {
            id: 0,
            name: "ใส่วัตถุดิบ",
            asset: "/navigation/ingredients.png",
        },
        {
            id: 1,
            name: "หม้อต้ม",
            asset: "/navigation/cauldron.png",
        },
        {
            id: 2,
            name: "ประวัติ",
            asset: "/navigation/history.png"
        },
        {
            id: 3,
            name: "ข้อมูล",
            asset: "/navigation/player.png"
        },
        {
            id: 4,
            name: "ตั้งค่า",
            asset: "/navigation/setting.png"
        }
    ]

    const handledAction = (id) => {
        switch ( id ) {
            case 0:
                if ( isMobile && potDataConf.get ) {
                    potDataConf.set(false)
                }
                ingredientsConf.set(!ingredientsConf.get)
                break;
            case 1:
                if ( isMobile && ingredientsConf.get ) {
                    ingredientsConf.set(false)
                }
                potDataConf.set(!potDataConf.get)
                break;
            case 2:
                historyConf.set(!historyConf.get)
                break;
            case 3:
                playerInfoConf.set(!playerInfoConf.get)
                break;
            case 4:
                settingConf.set(!settingConf.get)
                break;
            default:
                break;
        }
    }

    return (
        <div className={`
            w-fit h-20 self-center bg-[url("/texture/paper.jpg")] z-20
            border-4 border-[#b6562c]/50 flex gap-2 justify-center items-center px-2!
        `}>
            {
                navMenu.map(menu => (
                    <motion.button 
                        initial={{ scale: 1 }} 
                        whileHover={{ scale: 1.1, translateY: -10 }}
                        whileTap={{ scale: 0.95, transition: { type: "spring", stiffness: 300 } }}
                        key={menu.id} className="w-16 z-20 cursor-pointer h-full relative group" 
                        onClick={() => handledAction(menu.id)}>   
                        <span className='
                            absolute -top-5 left-0 right-0 
                            text-[#833a1b]
                            opacity-0 scale-0 w-fit! justify-self-center
                            group-hover:opacity-100 group-hover:scale-100 
                            duration-200
                        '>{menu.name}</span>
                        <motion.img  src={menu.asset} />
                    </motion.button>
                ))
            }
        </div>
    )
}