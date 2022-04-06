const hide = require("../../../../../core/auth/oauth/hwb/redirect/hideEmail");

test("it works", () => {
	expect(hide("a@bar.com")).toBe("a@bar.com");
	expect(hide("ab@bar.com")).toBe("ab@bar.com");
	expect(hide("abc@bar.com")).toBe("a*c@bar.com");
	expect(hide("abcd@bar.com")).toBe("a**d@bar.com");
	expect(hide("abcdefg@bar.com")).toBe("a*****g@bar.com");
	expect(hide("abcdefg@bar.co.uk")).toBe("a*****g@bar.co.uk");
	expect(hide("this.is.fairly@bar.co.uk")).toBe("t**s.is.f****y@bar.co.uk");
	expect(hide("lots-of_different.types@bar.co.uk")).toBe("l**s-of_d*******t.t***s@bar.co.uk");
});
