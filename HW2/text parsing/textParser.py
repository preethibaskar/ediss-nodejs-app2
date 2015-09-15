ifile = open('Project2Data.txt')
ofile = open('products.txt',"w")
cfile = open('categories.txt',"w")

text = ""
categoryText = ""
idVal = 0
counter = 1
for line in ifile:
	line = line.strip();
	if(line==""):
			continue
	elif(line.startswith('|')):
			# print line;
			for category in line[1:].split('|'):
					category = category.strip().split('[')[0]
					# multiple rows code--START--
					# cfile.writelines(str(counter)+"\t"+idVal+"\t"+category+"\n")
					# counter+=1
					# multiple rows code--END--
					categoryText+='_'+category
			cfile.writelines(str(counter)+"\t"+str(idVal)+"\t"+categoryText[1:]+"\n")
			categoryText=""
			counter+=1

	else:
		splitList = line.strip().split(' ',1);
		# if(splitList[0]=='Id:'):
		# 	ofile.writelines("\n"+splitList[1]+"\t"+"..");
		if(len(splitList) > 0):
			if(splitList[0] in ['Id:','ASIN:','title:','group:']):
				if(splitList[0]=='Id:'):
					text="\n"+splitList[1].strip();
					idVal = splitList[1].strip();
				else:
					text+="\t"+splitList[1].strip();
			
				#write the text into file
				ofile.writelines(text);
				#reset text pointer
				text=""

ifile.close();
ofile.close();
cfile.close();