/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

/** */
export const Indexable = superclass => class Indexable extends superclass
{
    keyType   = null;
    valueType = null;
    indexable = true;
};
