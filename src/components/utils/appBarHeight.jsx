import { useRef, useEffect, useState } from 'react';


// Function to get the height of the appbar.
function useAppBarHeight() {
    const appBarRef = useRef(null);
    const [appBarHeight, setAppBarHeight] = useState(0);

    useEffect(() => {
        if (appBarRef.current) {
            const height = appBarRef.current.clientHeight;
            setAppBarHeight(height);
        }
    }, [appBarRef]);


    return [appBarRef, appBarHeight];
}

export default useAppBarHeight;
